// apps/backend/src/routes/auth.ts
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { loginSchema } from '@factura-mg/shared';
import { z } from 'zod';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    console.log('📥 Login attempt - Body received:', req.body);
    
    const validationResult = loginSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      console.error('❌ Validation failed:', validationResult.error.errors);
      return res.status(400).json({ 
        error: 'Données invalides',
        details: validationResult.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    const { email, password } = validationResult.data;
    console.log('✅ Validation passed for email:', email);
    
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: {
        companyMemberships: {
          where: { isActive: true },
          include: {
            company: {
              include: {
                owner: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    currentPlan: true,
                    subscriptionStatus: true,
                    maxUsers: true,
                    maxArticles: true,
                    maxInvoices: true,
                    maxStorage: true
                  }
                }
              }
            }
          }
        }
      }
    });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    if (!user.isActive) {
      console.log('❌ User inactive:', email);
      return res.status(401).json({ error: 'Compte désactivé' });
    }

    console.log('✅ User found, checking password...');
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    console.log('✅ Password valid, updating lastLogin...');
    await prisma.user.update({ 
      where: { id: user.id }, 
      data: { lastLogin: new Date() } 
    });

    const token = jwt.sign(
      { 
        id: user.id, 
        userId: user.id, 
        email: user.email
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    console.log('✅ Login successful for:', email);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        defaultCompanyId: user.defaultCompanyId,
        currentPlan: user.currentPlan,
        subscriptionStatus: user.subscriptionStatus,
        maxUsers: user.maxUsers,
        maxArticles: user.maxArticles,
        maxInvoices: user.maxInvoices,
        maxStorage: user.maxStorage,
        companyMemberships: user.companyMemberships.map(m => ({
          id: m.id,
          companyId: m.company.id,
          role: m.role,
          position: m.position,
          company: {
            id: m.company.id,
            name: m.company.name,
            email: m.company.email,
            address: m.company.address,
            phone: m.company.phone,
            logo: m.company.logo,
            ownerId: m.company.ownerId,
            owner: m.company.owner
          }
        }))
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Données invalides', 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: 'Erreur serveur lors de la connexion' });
  }
});

router.post('/register', async (req, res) => {
  try {
    console.log('📥 Register attempt - Body received:', req.body);
    
    const { email, password, firstName, lastName, companyName, companyId } = req.body;
    
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    if (!companyName && !companyId) {
      return res.status(400).json({ 
        error: 'Vous devez soit créer une entreprise soit rejoindre une existante' 
      });
    }

    if (companyName && companyId) {
      return res.status(400).json({ 
        error: 'Vous ne pouvez pas créer et rejoindre une entreprise en même temps' 
      });
    }
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.log('❌ Email already exists:', email);
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // ── MODE 1: CRÉER UNE NOUVELLE COMPANY ──
    if (companyName) {
      console.log('✅ Creating new company:', companyName);
      
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          currentPlan: 'STARTER',
          subscriptionStatus: 'TRIAL',
          maxUsers: 5,
          maxArticles: 1000,
          maxInvoices: 1000,
          maxStorage: 5
        }
      });

      const company = await prisma.company.create({
        data: {
          name: companyName,
          email: email,
          ownerId: user.id
        }
      });

      const membership = await prisma.companyMember.create({
        data: {
          userId: user.id,
          companyId: company.id,
          role: 'OWNER',
          hireDate: new Date()
        }
      });

      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14);

      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: 'STARTER',
          status: 'TRIAL',
          billingPeriod: 'monthly',
          amount: 0,
          currency: 'EUR',
          trialEndDate,
          nextBillingDate: trialEndDate
        }
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { defaultCompanyId: company.id }
      });

      const token = jwt.sign(
        { 
          id: user.id, 
          userId: user.id, 
          email: user.email
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      console.log('✅ Registration successful (new company):', email);

      return res.status(201).json({ 
        token, 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          defaultCompanyId: company.id,
          currentPlan: user.currentPlan,
          subscriptionStatus: user.subscriptionStatus,
          maxUsers: user.maxUsers,
          maxArticles: user.maxArticles,
          maxInvoices: user.maxInvoices,
          maxStorage: user.maxStorage,
          companyMemberships: [{
            id: membership.id,
            companyId: company.id,
            role: 'OWNER',
            position: null,
            company: {
              id: company.id,
              name: company.name,
              email: company.email,
              logo: company.logo,
              ownerId: user.id,
              owner: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                currentPlan: user.currentPlan,
                subscriptionStatus: user.subscriptionStatus,
                maxUsers: user.maxUsers,
                maxArticles: user.maxArticles,
                maxInvoices: user.maxInvoices,
                maxStorage: user.maxStorage
              }
            }
          }]
        }
      });
    }
    
    // ── MODE 2: REJOINDRE UNE COMPANY EXISTANTE ──
    if (companyId) {
      console.log('✅ Joining existing company:', companyId);
      
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              currentPlan: true,
              subscriptionStatus: true,
              maxUsers: true,
              maxArticles: true,
              maxInvoices: true,
              maxStorage: true
            }
          },
          _count: {
            select: { members: true }
          }
        }
      });

      if (!company) {
        return res.status(404).json({ error: 'Entreprise non trouvée' });
      }

      // ✅ Valeurs par défaut si le owner n'a pas de plan (ne devrait pas arriver)
      const ownerMaxUsers = company.owner.maxUsers ?? 5;
      const ownerMaxArticles = company.owner.maxArticles ?? 1000;
      const ownerMaxInvoices = company.owner.maxInvoices ?? 1000;
      const ownerMaxStorage = company.owner.maxStorage ?? 5;
      const ownerPlan = company.owner.currentPlan ?? 'STARTER';
      const ownerStatus = company.owner.subscriptionStatus ?? 'TRIAL';

      const currentMemberCount = company._count.members;
      if (currentMemberCount >= ownerMaxUsers) {
        return res.status(403).json({ 
          error: `Cette entreprise a atteint sa limite de ${ownerMaxUsers} utilisateurs. Contactez l'administrateur pour upgrader le plan.` 
        });
      }

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          currentPlan: null,
          subscriptionStatus: null,
          maxUsers: null,
          maxArticles: null,
          maxInvoices: null,
          maxStorage: null
        }
      });

      const membership = await prisma.companyMember.create({
        data: {
          userId: user.id,
          companyId: company.id,
          role: 'MEMBER',
          hireDate: new Date()
        }
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { defaultCompanyId: company.id }
      });

      const token = jwt.sign(
        { 
          id: user.id, 
          userId: user.id, 
          email: user.email
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );

      console.log('✅ Registration successful (joined company):', email);

      return res.status(201).json({ 
        token, 
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          defaultCompanyId: company.id,
          currentPlan: ownerPlan,
          subscriptionStatus: ownerStatus,
          maxUsers: ownerMaxUsers,
          maxArticles: ownerMaxArticles,
          maxInvoices: ownerMaxInvoices,
          maxStorage: ownerMaxStorage,
          companyMemberships: [{
            id: membership.id,
            companyId: company.id,
            role: 'MEMBER',
            position: null,
            company: {
              id: company.id,
              name: company.name,
              email: company.email,
              logo: company.logo,
              ownerId: company.ownerId,
              owner: company.owner
            }
          }]
        }
      });
    }
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' });
  }
});

// Endpoint /auth/me pour vérifier le token

router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        companyMemberships: {
          where: { isActive: true },
          include: {
            company: {
              include: {
                owner: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    currentPlan: true,
                    subscriptionStatus: true,
                    maxUsers: true,
                    maxArticles: true,
                    maxInvoices: true,
                    maxStorage: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Utilisateur non trouvé' });
    }

    // ✅ Utiliser les valeurs du user par défaut
    let effectivePlan = user.currentPlan ?? 'STARTER';
    let effectiveStatus = user.subscriptionStatus ?? 'TRIAL';
    let effectiveMaxUsers = user.maxUsers ?? 5;
    let effectiveMaxArticles = user.maxArticles ?? 1000;
    let effectiveMaxInvoices = user.maxInvoices ?? 1000;
    let effectiveMaxStorage = user.maxStorage ?? 5;

    // Si l'utilisateur est membre (pas owner), utiliser le plan du owner
    if (user.defaultCompanyId) {
      const defaultMembership = user.companyMemberships.find(
        m => m.companyId === user.defaultCompanyId
      );
      
      if (defaultMembership && defaultMembership.role !== 'OWNER') {
        effectivePlan = defaultMembership.company.owner.currentPlan ?? 'STARTER';
        effectiveStatus = defaultMembership.company.owner.subscriptionStatus ?? 'TRIAL';
        effectiveMaxUsers = defaultMembership.company.owner.maxUsers ?? 5;
        effectiveMaxArticles = defaultMembership.company.owner.maxArticles ?? 1000;
        effectiveMaxInvoices = defaultMembership.company.owner.maxInvoices ?? 1000;
        effectiveMaxStorage = defaultMembership.company.owner.maxStorage ?? 5;
      }
    }

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,  // ✅ Ajouté
      avatar: user.avatar,
      defaultCompanyId: user.defaultCompanyId,
      currentPlan: effectivePlan,
      subscriptionStatus: effectiveStatus,
      maxUsers: effectiveMaxUsers,
      maxArticles: effectiveMaxArticles,
      maxInvoices: effectiveMaxInvoices,
      maxStorage: effectiveMaxStorage,
      companyMemberships: user.companyMemberships.map(m => ({
        id: m.id,
        companyId: m.company.id,
        role: m.role,
        position: m.position,
        company: {
          id: m.company.id,
          name: m.company.name,
          email: m.company.email,
          phone: m.company.phone,      // ✅ Ajouté
          address: m.company.address,  // ✅ Ajouté
          taxId: m.company.taxId,      // ✅ Ajouté
          logo: m.company.logo,
          ownerId: m.company.ownerId,
          owner: m.company.owner
        }
      }))
    });
  } catch (error) {
    console.error('❌ Auth/me error:', error);
    res.status(401).json({ error: 'Token invalide' });
  }
});

// Endpoint pour définir la company par défaut
router.patch('/default-company', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const { companyId } = req.body;
    
    const membership = await prisma.companyMember.findUnique({
      where: {
        userId_companyId: {
          userId: decoded.userId,
          companyId
        }
      }
    });

    if (!membership || !membership.isActive) {
      return res.status(403).json({ error: 'Accès refusé à cette company' });
    }

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { defaultCompanyId: companyId }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Default company error:', error);
    res.status(400).json({ error: 'Erreur' });
  }
});

router.post('/logout', async (req, res) => {
  return res.json({
    success: true,
    message: 'Déconnexion réussie',
  });
});

export default router;
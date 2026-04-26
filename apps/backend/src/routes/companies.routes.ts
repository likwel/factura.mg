// apps/backend/src/routes/companies.ts
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

const router = Router();
const prisma = new PrismaClient();

// Configuration Multer pour l'upload de logo
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/logos');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `logo-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Seuls les fichiers JPG et PNG sont autorisés'));
  }
});

// Helper: Vérifier les limites selon le plan
const checkOrganizationLimit = async (userId: string): Promise<{ canCreate: boolean; message?: string }> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedCompanies: true // Companies dont l'utilisateur est propriétaire
    }
  });

  if (!user) {
    return { canCreate: false, message: 'Utilisateur non trouvé' };
  }

  const limits: Record<string, number> = {
    STARTER: 1,
    PROFESSIONAL: 5,
    ENTERPRISE: -1 // Illimité
  };

  const currentPlan = user.currentPlan || 'STARTER';
  const limit = limits[currentPlan];

  if (limit === -1) return { canCreate: true }; // Illimité

  if (user.ownedCompanies.length >= limit) {
    return {
      canCreate: false,
      message: `Limite atteinte: votre plan ${currentPlan} permet ${limit} organisation(s) maximum`
    };
  }

  return { canCreate: true };
};

// Helper: Vérifier si l'utilisateur est owner ou admin
const checkPermission = async (userId: string, companyId: string, requiredRoles: ('OWNER' | 'ADMIN' | 'MEMBER')[] = ['OWNER', 'ADMIN']) => {
  const membership = await prisma.companyMember.findUnique({
    where: {
      userId_companyId: {
        userId,
        companyId
      }
    },
    include: {
      company: true
    }
  });

  if (!membership || !membership.isActive) {
    throw new Error('Accès non autorisé');
  }

  if (!requiredRoles.includes(membership.role)) {
    throw new Error(`Seuls les ${requiredRoles.join(' ou ')} peuvent effectuer cette action`);
  }

  return membership;
};

// ===== ROUTES PUBLIQUES =====

// Recherche de companies (public - pour l'inscription)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.json([]);
    }

    const companies = await prisma.company.findMany({
      where: {
        name: {
          contains: q,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        logo: true,
        _count: {
          select: {
            members: {
              where: { isActive: true }
            }
          }
        }
      },
      take: 10,
      orderBy: {
        name: 'asc'
      }
    });

    const formattedCompanies = companies.map(company => ({
      id: company.id,
      name: company.name,
      logo: company.logo,
      memberCount: company._count.members
    }));

    res.json(formattedCompanies);
  } catch (error) {
    console.error('Company search error:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});

// ===== ROUTES PROTÉGÉES =====

// Créer une nouvelle organisation
router.post('/', authenticate, upload.single('logo'), async (req, res) => {
  try {
    const userId = req.user!.id;
    const { name, description } = req.body;

    // Vérifier les limites du plan
    const { canCreate, message } = await checkOrganizationLimit(userId);
    if (!canCreate) {
      // Supprimer le fichier uploadé si la limite est atteinte
      if (req.file) {
        await fs.unlink(req.file.path);
      }
      return res.status(403).json({ error: message });
    }

    // Valider les données
    if (!name || name.trim().length < 2) {
      if (req.file) await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'Le nom doit contenir au moins 2 caractères' });
    }

    // Générer un email unique pour la company
    const companyEmail = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}@company.local`;

    // Créer l'organisation
    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        email: companyEmail,
        logo: req.file ? `/uploads/logos/${req.file.filename}` : null,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
            isActive: true,
            invitedAt: new Date()
          }
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            currentPlan: true,
            subscriptionStatus: true,
            maxUsers: true,
            maxArticles: true,
            maxInvoices: true,
            maxStorage: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    res.status(201).json(company);
  } catch (error: any) {
    console.error('Create company error:', error);
    // Nettoyer le fichier en cas d'erreur
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    
    // Gérer les erreurs de contrainte unique
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Une organisation avec cet email existe déjà' });
    }
    
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
});

// Récupérer les détails d'une organisation
router.get('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Vérifier que l'utilisateur est membre
    const membership = await prisma.companyMember.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId: id
        }
      }
    });

    if (!membership || !membership.isActive) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address : true,
            taxId :true,
            currentPlan: true,
            subscriptionStatus: true,
            maxUsers: true,
            maxArticles: true,
            maxInvoices: true,
            maxStorage: true
          }
        },
        members: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    if (!company) {
      return res.status(404).json({ error: 'Organisation non trouvée' });
    }

    res.json(company);
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération' });
  }
});

// Modifier une organisation (OWNER ou ADMIN uniquement)
router.put('/:id', authenticate, upload.single('logo'), async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { name, description, email, phone, address, taxId } = req.body;

    // Vérifier les permissions
    await checkPermission(userId, id, ['OWNER', 'ADMIN']);

    // Valider les données
    if (name && name.trim().length < 2) {
      if (req.file) await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'Le nom doit contenir au moins 2 caractères' });
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.trim();
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    if (address !== undefined) updateData.address = address?.trim() || null;
    if (taxId !== undefined) updateData.taxId = taxId?.trim() || null;
    
    // Gérer le nouveau logo
    if (req.file) {
      // Récupérer l'ancien logo pour le supprimer
      const oldCompany = await prisma.company.findUnique({
        where: { id },
        select: { logo: true }
      });

      updateData.logo = `/uploads/logos/${req.file.filename}`;

      // Supprimer l'ancien logo
      if (oldCompany?.logo) {
        const oldLogoPath = path.join(__dirname, '../../', oldCompany.logo);
        await fs.unlink(oldLogoPath).catch(() => {});
      }
    }

    // Mettre à jour l'organisation
    const company = await prisma.company.update({
      where: { id },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            // phone: true,
            // address : true,
            // taxId : true,
            currentPlan: true,
            subscriptionStatus: true,
            maxUsers: true,
            maxArticles: true,
            maxInvoices: true,
            maxStorage: true
          }
        },
        members: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    res.json(company);
  } catch (error: any) {
    console.error('Update company error:', error);
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    
    if (error instanceof Error && error.message === 'Accès non autorisé') {
      return res.status(403).json({ error: error.message });
    }
    
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    
    res.status(500).json({ error: 'Erreur lors de la modification' });
  }
});

// Supprimer une organisation (OWNER uniquement)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Seul le OWNER peut supprimer
    const membership = await checkPermission(userId, id, ['OWNER']);

    // Récupérer le logo pour le supprimer
    const company = await prisma.company.findUnique({
      where: { id },
      select: { logo: true }
    });

    // Supprimer l'organisation (cascade automatique sur les membres grâce au schéma)
    await prisma.company.delete({
      where: { id }
    });

    // Supprimer le logo du système de fichiers
    if (company?.logo) {
      const logoPath = path.join(__dirname, '../../', company.logo);
      await fs.unlink(logoPath).catch(() => {});
    }

    res.json({ message: 'Organisation supprimée avec succès' });
  } catch (error) {
    console.error('Delete company error:', error);
    
    if (error instanceof Error && error.message.includes('Seuls les OWNER')) {
      return res.status(403).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// Quitter une organisation (Membre uniquement, pas le OWNER)
router.post('/:id/leave', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const membership = await prisma.companyMember.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId: id
        }
      },
      include: {
        company: true
      }
    });

    if (!membership) {
      return res.status(404).json({ error: 'Vous n\'êtes pas membre de cette organisation' });
    }

    // Le OWNER ne peut pas quitter sa propre organisation
    if (membership.company.ownerId === userId) {
      return res.status(403).json({ 
        error: 'Vous ne pouvez pas quitter votre propre organisation. Supprimez-la ou transférez la propriété.' 
      });
    }

    // Désactiver le membership
    await prisma.companyMember.update({
      where: {
        userId_companyId: {
          userId,
          companyId: id
        }
      },
      data: {
        isActive: false
      }
    });

    res.json({ message: 'Vous avez quitté l\'organisation avec succès' });
  } catch (error) {
    console.error('Leave company error:', error);
    res.status(500).json({ error: 'Erreur lors du départ' });
  }
});

export default router;
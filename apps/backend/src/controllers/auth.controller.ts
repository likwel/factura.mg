import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { loginSchema } from '@factura-mg/shared';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email }, include: { company: true } });
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

    const token = jwt.sign(
      { id: user.id, email: user.email, companyId: user.companyId, role: user.role, permissions: user.permissions || [] },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        company: user.company
      }
    });
  } catch (error) {
    res.status(400).json({ error: 'Erreur de connexion' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, companyName } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email déjà utilisé' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const company = await prisma.company.create({
      data: {
        name: companyName,
        email: email,
        subscriptionPlan: 'FREE',
        users: {
          create: { email, password: hashedPassword, firstName, lastName, role: 'ADMIN' }
        }
      },
      include: { users: true }
    });

    const user = company.users[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, companyId: user.companyId, role: user.role, permissions: [] },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, user: { ...user, company } });
  } catch (error) {
    res.status(400).json({ error: 'Erreur d\'inscription' });
  }
});

export default router;

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Configuration de multer pour l'upload d'avatar
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/avatars');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Seules les images sont autorisées (jpeg, jpg, png, gif, webp)'));
  }
});

// Récupérer le profil de l'utilisateur connecté
router.get('/me', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        currentPlan: true,
        subscriptionStatus: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

// Modifier le profil de l'utilisateur connecté
router.put('/me', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.user!.id;
    const { firstName, lastName, email, phone } = req.body;

    // Validation des données
    if (firstName && firstName.trim().length < 2) {
      if (req.file) await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'Le prénom doit contenir au moins 2 caractères' });
    }

    if (lastName && lastName.trim().length < 2) {
      if (req.file) await fs.unlink(req.file.path);
      return res.status(400).json({ error: 'Le nom doit contenir au moins 2 caractères' });
    }

    // Valider l'email si fourni
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        if (req.file) await fs.unlink(req.file.path);
        return res.status(400).json({ error: 'Adresse email invalide' });
      }

      // Vérifier si l'email est déjà utilisé par un autre utilisateur
      const existingUser = await prisma.user.findFirst({
        where: {
          email: email.trim().toLowerCase(),
          NOT: { id: userId }
        }
      });

      if (existingUser) {
        if (req.file) await fs.unlink(req.file.path);
        return res.status(400).json({ error: 'Cet email est déjà utilisé' });
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {};
    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (email) updateData.email = email.trim().toLowerCase();
    if (phone !== undefined) updateData.phone = phone?.trim() || null;
    
    // Gérer le nouvel avatar
    if (req.file) {
      // Récupérer l'ancien avatar pour le supprimer
      const oldUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatar: true }
      });

      updateData.avatar = `/uploads/avatars/${req.file.filename}`;

      // Supprimer l'ancien avatar
      if (oldUser?.avatar) {
        const oldAvatarPath = path.join(__dirname, '../../', oldUser.avatar);
        await fs.unlink(oldAvatarPath).catch(() => {});
      }
    }

    // Mettre à jour l'utilisateur
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        currentPlan: true,
        subscriptionStatus: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.json(user);
  } catch (error: any) {
    console.error('Update user profile error:', error);
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    
    res.status(500).json({ error: 'Erreur lors de la modification du profil' });
  }
});

// Modifier le mot de passe
router.put('/me/password', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Les mots de passe ne correspondent pas' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Vérifier le mot de passe actuel
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Erreur lors de la modification du mot de passe' });
  }
});

export default router;
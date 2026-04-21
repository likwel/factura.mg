// src/controllers/categories.controller.ts

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createCategorySchema, updateCategorySchema } from '../validators';

const router = Router();

// ============================================================================
// CREATE CATEGORY
// ============================================================================

router.post(
  '/',
  authenticate,
  validateRequest(createCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, description, parentId } = req.body;
      const companyId = req.user!.companyId;

      // Check if category name already exists
      const existing = await prisma.category.findFirst({
        where: { name, companyId }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Une catégorie avec ce nom existe déjà'
        });
      }

      // If parentId is provided, verify it exists
      if (parentId) {
        const parent = await prisma.category.findFirst({
          where: { id: parentId, companyId }
        });

        if (!parent) {
          return res.status(400).json({
            success: false,
            message: 'Catégorie parente non trouvée'
          });
        }
      }

      // Create category
      const category = await prisma.category.create({
        data: {
          name,
          description: description || null,
          parentId: parentId || null,
          companyId
        },
        include: {
          parent: true
        }
      });

      res.status(201).json({
        success: true,
        data: category,
        message: 'Catégorie créée avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// GET ALL CATEGORIES (with hierarchy)
// ============================================================================

router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user!.companyId;
      const { includeHierarchy } = req.query;

      if (includeHierarchy === 'true') {
        // Get root categories with their children
        const categories = await prisma.category.findMany({
          where: {
            companyId,
            parentId: null
          },
          include: {
            children: {
              include: {
                children: true
              }
            },
            _count: {
              select: { articles: true }
            }
          },
          orderBy: { name: 'asc' }
        });

        res.json({
          success: true,
          data: categories
        });
      } else {
        // Get flat list of all categories
        const categories = await prisma.category.findMany({
          where: { companyId },
          include: {
            parent: {
              select: {
                id: true,
                name: true
              }
            },
            _count: {
              select: { articles: true }
            }
          },
          orderBy: { name: 'asc' }
        });

        res.json({
          success: true,
          data: categories
        });
      }
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// GET CATEGORY BY ID
// ============================================================================

router.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;

      const category = await prisma.category.findFirst({
        where: { id, companyId },
        include: {
          parent: true,
          children: true,
          articles: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          },
          _count: {
            select: { articles: true }
          }
        }
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Catégorie non trouvée'
        });
      }

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// UPDATE CATEGORY
// ============================================================================

router.put(
  '/:id',
  authenticate,
  validateRequest(updateCategorySchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;
      const { name, description, parentId } = req.body;

      // Check if category exists
      const category = await prisma.category.findFirst({
        where: { id, companyId }
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Catégorie non trouvée'
        });
      }

      // Check if new name conflicts
      if (name && name !== category.name) {
        const existing = await prisma.category.findFirst({
          where: {
            name,
            companyId,
            id: { not: id }
          }
        });

        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Une catégorie avec ce nom existe déjà'
          });
        }
      }

      // Prevent circular reference
      if (parentId && parentId === id) {
        return res.status(400).json({
          success: false,
          message: 'Une catégorie ne peut pas être sa propre parente'
        });
      }

      // If changing parent, verify it exists and not a child of current category
      if (parentId && parentId !== category.parentId) {
        const parent = await prisma.category.findFirst({
          where: { id: parentId, companyId }
        });

        if (!parent) {
          return res.status(400).json({
            success: false,
            message: 'Catégorie parente non trouvée'
          });
        }

        // Check if parent is a child of current category (prevent circular reference)
        if (parent.parentId === id) {
          return res.status(400).json({
            success: false,
            message: 'Impossible de définir une catégorie enfant comme parente'
          });
        }
      }

      // Update category
      const updated = await prisma.category.update({
        where: { id },
        data: {
          name,
          description,
          parentId: parentId || null
        },
        include: {
          parent: true
        }
      });

      res.json({
        success: true,
        data: updated,
        message: 'Catégorie mise à jour avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// DELETE CATEGORY
// ============================================================================

router.delete(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;

      // Check if category exists
      const category = await prisma.category.findFirst({
        where: { id, companyId }
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Catégorie non trouvée'
        });
      }

      // Check if category has children
      const childrenCount = await prisma.category.count({
        where: { parentId: id }
      });

      if (childrenCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de supprimer cette catégorie car elle a des sous-catégories'
        });
      }

      // Check if category has articles
      const articlesCount = await prisma.article.count({
        where: { categoryId: id }
      });

      if (articlesCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de supprimer cette catégorie car elle a des articles associés'
        });
      }

      // Delete category
      await prisma.category.delete({ where: { id } });

      res.json({
        success: true,
        message: 'Catégorie supprimée avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
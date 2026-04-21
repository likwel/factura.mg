// src/controllers/suppliers.controller.ts

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createSupplierSchema, updateSupplierSchema } from '../validators';

const router = Router();

// ============================================================================
// CREATE SUPPLIER
// ============================================================================

router.post(
  '/',
  authenticate,
  validateRequest(createSupplierSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, name, email, phone, address, taxId } = req.body;
      const companyId = req.user!.companyId;

      // Check if code already exists
      const existing = await prisma.supplier.findFirst({
        where: { code, companyId }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Un fournisseur avec ce code existe déjà'
        });
      }

      // Create supplier
      const supplier = await prisma.supplier.create({
        data: {
          code,
          name,
          email: email || null,
          phone: phone || null,
          address: address || null,
          taxId: taxId || null,
          companyId
        }
      });

      res.status(201).json({
        success: true,
        data: supplier,
        message: 'Fournisseur créé avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// GET ALL SUPPLIERS
// ============================================================================

router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user!.companyId;
      const { search, isActive, page = 1, limit = 10 } = req.query;

      const where: any = { companyId };

      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { code: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [suppliers, total] = await Promise.all([
        prisma.supplier.findMany({
          where,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.supplier.count({ where })
      ]);

      res.json({
        success: true,
        data: suppliers,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// GET SUPPLIER BY ID
// ============================================================================

router.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;

      const supplier = await prisma.supplier.findFirst({
        where: { id, companyId },
        include: {
          articles: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Fournisseur non trouvé'
        });
      }

      res.json({
        success: true,
        data: supplier
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// UPDATE SUPPLIER
// ============================================================================

router.put(
  '/:id',
  authenticate,
  validateRequest(updateSupplierSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;
      const updateData = req.body;

      // Check if supplier exists
      const supplier = await prisma.supplier.findFirst({
        where: { id, companyId }
      });

      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Fournisseur non trouvé'
        });
      }

      // Check if new code conflicts
      if (updateData.code && updateData.code !== supplier.code) {
        const existing = await prisma.supplier.findFirst({
          where: {
            code: updateData.code,
            companyId,
            id: { not: id }
          }
        });

        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Un fournisseur avec ce code existe déjà'
          });
        }
      }

      // Update supplier
      const updated = await prisma.supplier.update({
        where: { id },
        data: updateData
      });

      res.json({
        success: true,
        data: updated,
        message: 'Fournisseur mis à jour avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// DELETE SUPPLIER
// ============================================================================

router.delete(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;

      // Check if supplier exists
      const supplier = await prisma.supplier.findFirst({
        where: { id, companyId }
      });

      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Fournisseur non trouvé'
        });
      }

      // Check if supplier has associated articles
      const articlesCount = await prisma.article.count({
        where: { supplierId: id }
      });

      if (articlesCount > 0) {
        return res.status(400).json({
          success: false,
          message: 'Impossible de supprimer ce fournisseur car il a des articles associés'
        });
      }

      // Delete supplier
      await prisma.supplier.delete({ where: { id } });

      res.json({
        success: true,
        message: 'Fournisseur supprimé avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
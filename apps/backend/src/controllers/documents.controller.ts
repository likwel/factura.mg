// src/controllers/documents.controller.ts

import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { createDocumentSchema, updateDocumentStatusSchema } from '../validators';
import { InvoiceStatus } from '@prisma/client';

const router = Router();

// ============================================================================
// CREATE DOCUMENT (Invoice/Quote/Order/etc.)
// ============================================================================

router.post(
  '/',
  authenticate,
  validateRequest(createDocumentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        invoiceNumber,
        clientId,
        supplierId,
        items,
        subtotal,
        discount,
        tax,
        total,
        notes,
        dueDate,
        documentType // devis, commande, facture, bl, avoir, expedition
      } = req.body;

      const companyId = req.user!.companyId;
      const userId = req.user!.id;

      // Verify client or supplier exists
      if (clientId) {
        const client = await prisma.client.findFirst({
          where: { id: clientId, companyId }
        });
        if (!client) {
          return res.status(404).json({
            success: false,
            message: 'Client non trouvé'
          });
        }
      }

      if (supplierId) {
        const supplier = await prisma.supplier.findFirst({
          where: { id: supplierId, companyId }
        });
        if (!supplier) {
          return res.status(404).json({
            success: false,
            message: 'Fournisseur non trouvé'
          });
        }
      }

      // Check if invoice number already exists
      const existing = await prisma.invoice.findFirst({
        where: { invoiceNumber, companyId }
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Un document avec ce numéro existe déjà'
        });
      }

      // Create invoice with items
      const invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          clientId: clientId || null,
          userId,
          companyId,
          status: documentType === 'devis' ? 'DRAFT' : 'PENDING',
          subtotal,
          discount,
          tax,
          total,
          notes: notes || null,
          dueDate: dueDate ? new Date(dueDate) : null,
          items: {
            create: items.map((item: any) => ({
              articleId: item.articleId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount || 0,
              total: item.total
            }))
          }
        },
        include: {
          items: {
            include: {
              article: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  unit: true
                }
              }
            }
          },
          client: {
            select: {
              id: true,
              code: true,
              name: true,
              email: true
            }
          },
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        }
      });

      // Update stock for invoices (not for quotes)
      if (documentType !== 'devis' && clientId) {
        for (const item of items) {
          await prisma.article.update({
            where: { id: item.articleId },
            data: {
              currentStock: {
                decrement: item.quantity
              }
            }
          });
        }
      }

      res.status(201).json({
        success: true,
        data: invoice,
        message: `${getDocumentLabel(documentType)} créé(e) avec succès`
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// GET ALL DOCUMENTS
// ============================================================================

router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const companyId = req.user!.companyId;
      const {
        status,
        clientId,
        supplierId,
        startDate,
        endDate,
        page = 1,
        limit = 10
      } = req.query;

      const where: any = { companyId };

      if (status) {
        where.status = status as InvoiceStatus;
      }

      if (clientId) {
        where.clientId = clientId as string;
      }

      if (supplierId) {
        // Note: Your schema doesn't have supplierId on Invoice, might need to add it
        // For now, we'll skip this filter
      }

      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        };
      }

      const skip = (Number(page) - 1) * Number(limit);

      const [invoices, total] = await Promise.all([
        prisma.invoice.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            client: {
              select: {
                id: true,
                code: true,
                name: true
              }
            },
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            items: {
              include: {
                article: {
                  select: {
                    id: true,
                    name: true,
                    code: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.invoice.count({ where })
      ]);

      res.json({
        success: true,
        data: invoices,
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
// GET DOCUMENT BY ID
// ============================================================================

router.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;

      const invoice = await prisma.invoice.findFirst({
        where: { id, companyId },
        include: {
          client: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          items: {
            include: {
              article: true
            }
          },
          transactions: true
        }
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Document non trouvé'
        });
      }

      res.json({
        success: true,
        data: invoice
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// UPDATE DOCUMENT STATUS
// ============================================================================

router.patch(
  '/:id/status',
  authenticate,
  validateRequest(updateDocumentStatusSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const companyId = req.user!.companyId;

      // Check if invoice exists
      const invoice = await prisma.invoice.findFirst({
        where: { id, companyId }
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Document non trouvé'
        });
      }

      // Update status
      const updateData: any = { status };

      // If marking as paid, set paidDate
      if (status === 'PAID' && !invoice.paidDate) {
        updateData.paidDate = new Date();
      }

      const updated = await prisma.invoice.update({
        where: { id },
        data: updateData,
        include: {
          client: true,
          items: {
            include: {
              article: true
            }
          }
        }
      });

      res.json({
        success: true,
        data: updated,
        message: 'Statut mis à jour avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// DELETE DOCUMENT
// ============================================================================

router.delete(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const companyId = req.user!.companyId;

      // Check if invoice exists
      const invoice = await prisma.invoice.findFirst({
        where: { id, companyId },
        include: {
          items: true
        }
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Document non trouvé'
        });
      }

      // Don't allow deletion of paid invoices
      if (invoice.status === 'PAID') {
        return res.status(400).json({
          success: false,
          message: 'Impossible de supprimer un document payé'
        });
      }

      // Restore stock if needed
      if (invoice.status !== 'DRAFT' && invoice.clientId) {
        for (const item of invoice.items) {
          await prisma.article.update({
            where: { id: item.articleId },
            data: {
              currentStock: {
                increment: item.quantity
              }
            }
          });
        }
      }

      // Delete invoice (items will be deleted via cascade)
      await prisma.invoice.delete({ where: { id } });

      res.json({
        success: true,
        message: 'Document supprimé avec succès'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getDocumentLabel(type: string): string {
  const labels: Record<string, string> = {
    devis: 'Devis',
    commande: 'Commande',
    facture: 'Facture',
    bl: 'Bon de livraison',
    avoir: 'Avoir',
    expedition: 'Expédition'
  };
  return labels[type] || 'Document';
}

export default router;
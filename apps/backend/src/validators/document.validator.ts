import { z } from 'zod';

const documentItemSchema = z.object({
  articleId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  discount: z.number().min(0).max(100).default(0),
  total: z.number().positive()
});

export const createDocumentSchema = z.object({
  invoiceNumber: z.string().min(1).max(100),
  clientId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  items: z.array(documentItemSchema).min(1),
  subtotal: z.number().positive(),
  discount: z.number().min(0).max(100).default(0),
  tax: z.number().min(0).max(100).default(0),
  total: z.number().positive(),
  notes: z.string().max(1000).optional().or(z.literal('')),
  dueDate: z.string().datetime().optional().or(z.literal('')),
  documentType: z.enum(['devis', 'commande', 'facture', 'bl', 'avoir', 'expedition'])
}).refine((data) => data.clientId || data.supplierId, {
  message: 'Un client ou un fournisseur doit être spécifié'
});

export const updateDocumentStatusSchema = z.object({
  status: z.enum(['DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED'])
});

// src/validators/index.ts

import { z } from 'zod';

// ============================================================================
// SUPPLIER VALIDATORS
// ============================================================================

export const createSupplierSchema = z.object({
  code: z
    .string()
    .min(2, 'Le code doit contenir au moins 2 caractères')
    .max(50, 'Le code ne peut pas dépasser 50 caractères'),
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(255, 'Le nom ne peut pas dépasser 255 caractères'),
  email: z
    .string()
    .email('Email invalide')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .min(8, 'Le téléphone doit contenir au moins 8 caractères')
    .max(20, 'Le téléphone ne peut pas dépasser 20 caractères')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'L\'adresse ne peut pas dépasser 500 caractères')
    .optional()
    .or(z.literal('')),
  taxId: z
    .string()
    .max(50, 'Le NIF/STAT ne peut pas dépasser 50 caractères')
    .optional()
    .or(z.literal(''))
});

export const updateSupplierSchema = z.object({
  code: z
    .string()
    .min(2, 'Le code doit contenir au moins 2 caractères')
    .max(50, 'Le code ne peut pas dépasser 50 caractères')
    .optional(),
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(255, 'Le nom ne peut pas dépasser 255 caractères')
    .optional(),
  email: z
    .string()
    .email('Email invalide')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .min(8, 'Le téléphone doit contenir au moins 8 caractères')
    .max(20, 'Le téléphone ne peut pas dépasser 20 caractères')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'L\'adresse ne peut pas dépasser 500 caractères')
    .optional()
    .or(z.literal('')),
  taxId: z
    .string()
    .max(50, 'Le NIF/STAT ne peut pas dépasser 50 caractères')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean().optional()
}).strict();

// ============================================================================
// CATEGORY VALIDATORS
// ============================================================================

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(255, 'Le nom ne peut pas dépasser 255 caractères'),
  description: z
    .string()
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .optional()
    .or(z.literal('')),
  parentId: z
    .string()
    .uuid('ID de catégorie parente invalide')
    .optional()
    .or(z.literal(''))
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(255, 'Le nom ne peut pas dépasser 255 caractères')
    .optional(),
  description: z
    .string()
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .optional()
    .or(z.literal('')),
  parentId: z
    .string()
    .uuid('ID de catégorie parente invalide')
    .optional()
    .or(z.literal(''))
}).strict();

// ============================================================================
// DOCUMENT VALIDATORS
// ============================================================================

const documentItemSchema = z.object({
  articleId: z.string().uuid('ID article invalide'),
  quantity: z.number().int().positive('La quantité doit être positive'),
  unitPrice: z.number().positive('Le prix unitaire doit être positif'),
  discount: z.number().min(0).max(100).default(0),
  total: z.number().positive('Le total doit être positif')
});

export const createDocumentSchema = z.object({
  invoiceNumber: z
    .string()
    .min(1, 'Le numéro de document est requis')
    .max(100, 'Le numéro ne peut pas dépasser 100 caractères'),
  clientId: z
    .string()
    .uuid('ID client invalide')
    .optional(),
  supplierId: z
    .string()
    .uuid('ID fournisseur invalide')
    .optional(),
  items: z
    .array(documentItemSchema)
    .min(1, 'Au moins un article est requis'),
  subtotal: z.number().positive('Le sous-total doit être positif'),
  discount: z.number().min(0).max(100).default(0),
  tax: z.number().min(0).max(100).default(0),
  total: z.number().positive('Le total doit être positif'),
  notes: z
    .string()
    .max(1000, 'Les notes ne peuvent pas dépasser 1000 caractères')
    .optional()
    .or(z.literal('')),
  dueDate: z
    .string()
    .datetime('Date d\'échéance invalide')
    .optional()
    .or(z.literal('')),
  documentType: z.enum(
    ['devis', 'commande', 'facture', 'bl', 'avoir', 'expedition'],
    { errorMap: () => ({ message: 'Type de document invalide' }) }
  )
}).refine(
  (data) => data.clientId || data.supplierId,
  {
    message: 'Un client ou un fournisseur doit être spécifié',
    path: ['clientId']
  }
);

export const updateDocumentStatusSchema = z.object({
  status: z.enum(
    ['DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED'],
    { errorMap: () => ({ message: 'Statut invalide' }) }
  )
});

// ============================================================================
// COMPANY VALIDATORS
// ============================================================================

export const createCompanySchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(255, 'Le nom ne peut pas dépasser 255 caractères'),
  email: z.string().email('Email invalide'),
  phone: z
    .string()
    .min(8, 'Le téléphone doit contenir au moins 8 caractères')
    .max(20, 'Le téléphone ne peut pas dépasser 20 caractères')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'L\'adresse ne peut pas dépasser 500 caractères')
    .optional()
    .or(z.literal('')),
  taxId: z
    .string()
    .max(50, 'Le NIF/STAT ne peut pas dépasser 50 caractères')
    .optional()
    .or(z.literal(''))
});

export const updateCompanySchema = z.object({
  name: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(255, 'Le nom ne peut pas dépasser 255 caractères')
    .optional(),
  email: z.string().email('Email invalide').optional(),
  phone: z
    .string()
    .min(8, 'Le téléphone doit contenir au moins 8 caractères')
    .max(20, 'Le téléphone ne peut pas dépasser 20 caractères')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(500, 'L\'adresse ne peut pas dépasser 500 caractères')
    .optional()
    .or(z.literal('')),
  taxId: z
    .string()
    .max(50, 'Le NIF/STAT ne peut pas dépasser 50 caractères')
    .optional()
    .or(z.literal('')),
  logo: z
    .string()
    .url('URL du logo invalide')
    .optional()
    .or(z.literal('')),
  subscriptionPlan: z
    .enum(['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'])
    .optional()
}).strict();

// ============================================================================
// TYPE EXPORTS (pour utilisation dans les contrôleurs)
// ============================================================================

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentStatusInput = z.infer<typeof updateDocumentStatusSchema>;
export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
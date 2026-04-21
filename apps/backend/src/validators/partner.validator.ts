// backend/src/validators/partner.validator.ts

import { z } from 'zod';

/**
 * Validation schema for creating a partner
 */
export const createPartnerSchema = z.object({
  code: z
    .string()
    .min(2, 'Le code doit contenir au moins 2 caractères')
    .max(50, 'Le code ne peut pas dépasser 50 caractères')
    .regex(/^[A-Z0-9-_]+$/i, 'Le code ne peut contenir que des lettres, chiffres, tirets et underscores'),
  
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
    .min(8, 'Le numéro de téléphone doit contenir au moins 8 caractères')
    .max(20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères')
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
  
  creditLimit: z
    .number()
    .min(0, 'La limite de crédit doit être positive')
    .optional()
    .or(z.string().transform((val) => val ? parseFloat(val) : undefined)),
  
  type: z.enum(['client', 'supplier'], {
    errorMap: () => ({ message: 'Le type doit être "client" ou "supplier"' })
  })
});

/**
 * Validation schema for updating a partner
 */
export const updatePartnerSchema = z.object({
  code: z
    .string()
    .min(2, 'Le code doit contenir au moins 2 caractères')
    .max(50, 'Le code ne peut pas dépasser 50 caractères')
    .regex(/^[A-Z0-9-_]+$/i, 'Le code ne peut contenir que des lettres, chiffres, tirets et underscores')
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
    .min(8, 'Le numéro de téléphone doit contenir au moins 8 caractères')
    .max(20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères')
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
  
  creditLimit: z
    .number()
    .min(0, 'La limite de crédit doit être positive')
    .optional()
    .or(z.string().transform((val) => val ? parseFloat(val) : undefined)),
  
  isActive: z.boolean().optional()
}).strict();

/**
 * Validation schema for partner ID parameter
 */
export const partnerIdSchema = z.object({
  id: z.string().uuid('ID invalide')
});

/**
 * Type inference from schemas
 */
export type CreatePartnerInput = z.infer<typeof createPartnerSchema>;
export type UpdatePartnerInput = z.infer<typeof updatePartnerSchema>;
export type PartnerIdInput = z.infer<typeof partnerIdSchema>;
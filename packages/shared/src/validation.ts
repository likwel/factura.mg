import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe minimum 6 caractères')
});

export const articleSchema = z.object({
  name: z.string().min(1, 'Nom requis'),
  code: z.string().min(1, 'Code requis'),
  description: z.string().optional(),
  purchasePrice: z.number().min(0),
  sellingPrice: z.number().min(0),
  stockMin: z.number().min(0).default(0),
  stockMax: z.number().min(0).optional(),
  categoryId: z.string().optional(),
  supplierId: z.string().optional()
});

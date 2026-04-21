
// src/validators/supplier.validator.ts

import { z } from 'zod';

export const createSupplierSchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(255),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(8).max(20).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  taxId: z.string().max(50).optional().or(z.literal(''))
});

export const updateSupplierSchema = z.object({
  code: z.string().min(2).max(50).optional(),
  name: z.string().min(2).max(255).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().min(8).max(20).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  taxId: z.string().max(50).optional().or(z.literal('')),
  isActive: z.boolean().optional()
});

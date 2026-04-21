
// ============================================================================
// src/validators/category.validator.ts
// ============================================================================
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(2).max(255),
  description: z.string().max(1000).optional().or(z.literal('')),
  parentId: z.string().uuid().optional().or(z.literal(''))
});

export const updateCategorySchema = z.object({
  name: z.string().min(2).max(255).optional(),
  description: z.string().max(1000).optional().or(z.literal('')),
  parentId: z.string().uuid().optional().or(z.literal(''))
});
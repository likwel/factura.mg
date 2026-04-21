import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email(),
  phone: z.string().min(8).max(20).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  taxId: z.string().max(50).optional().or(z.literal(''))
});

export const updateCompanySchema = z.object({
  name: z.string().min(2).max(255).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(8).max(20).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  taxId: z.string().max(50).optional().or(z.literal('')),
  logo: z.string().url().optional().or(z.literal('')),
  subscriptionPlan: z.enum(['FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE']).optional()
});
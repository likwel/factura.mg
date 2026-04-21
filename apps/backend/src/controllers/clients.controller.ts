import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const clients = await prisma.client.findMany({
    where: { companyId: req.user!.companyId },
    include: { invoices: true, debts: true }
  });
  res.json(clients);
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  const client = await prisma.client.create({
    data: { ...req.body, companyId: req.user!.companyId }
  });
  res.status(201).json(client);
});

export default router;

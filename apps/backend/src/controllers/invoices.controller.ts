import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { io } from '../index';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const invoices = await prisma.invoice.findMany({
    where: { companyId: req.user!.companyId },
    include: { client: true, items: { include: { article: true } } }
  });
  res.json(invoices);
});

router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { clientId, items } = req.body;
  const subtotal = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
  
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: `INV-${Date.now()}`,
      clientId,
      userId: req.user!.id,
      companyId: req.user!.companyId,
      subtotal,
      total: subtotal,
      items: { create: items.map((item: any) => ({
        articleId: item.articleId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice
      }))}
    }
  });
  
  io.to(`company:${req.user!.companyId}`).emit('invoice:created', invoice);
  res.status(201).json(invoice);
});

export default router;

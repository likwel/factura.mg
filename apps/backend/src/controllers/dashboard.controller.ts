import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.get('/stats', authenticate, async (req: AuthRequest, res) => {
  const [totalArticles, totalClients, totalInvoices, lowStockArticles] = await Promise.all([
    prisma.article.count({ where: { companyId: req.user!.companyId } }),
    prisma.client.count({ where: { companyId: req.user!.companyId } }),
    prisma.invoice.count({ where: { companyId: req.user!.companyId } }),
    prisma.article.findMany({
      where: {
        companyId: req.user!.companyId,
        currentStock: { lte: prisma.article.fields.stockMin }
      },
      take: 10
    })
  ]);
  
  res.json({ totalArticles, totalClients, totalInvoices, totalRevenue: 0, lowStockArticles });
});

export default router;

import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';
import { Permission } from '@factura-mg/shared';

const router = Router();

router.get('/', authenticate, authorize(Permission.VIEW_ARTICLES), async (req: AuthRequest, res) => {
  const articles = await prisma.article.findMany({
    where: { companyId: req.user!.companyId },
    include: { category: true, supplier: true }
  });
  res.json(articles);
});

router.post('/', authenticate, authorize(Permission.CREATE_ARTICLES), async (req: AuthRequest, res) => {
  const article = await prisma.article.create({
    data: { ...req.body, companyId: req.user!.companyId }
  });
  res.status(201).json(article);
});

export default router;

import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.get('/movements', authenticate, async (req: AuthRequest, res) => {
  const movements = await prisma.stockMovement.findMany({
    where: { warehouse: { companyId: req.user!.companyId } },
    include: { article: true, warehouse: true, user: true }
  });
  res.json(movements);
});

export default router;

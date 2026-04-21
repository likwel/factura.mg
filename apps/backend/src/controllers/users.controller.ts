import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const users = await prisma.user.findMany({
    where: { companyId: req.user!.companyId },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true }
  });
  res.json(users);
});

export default router;

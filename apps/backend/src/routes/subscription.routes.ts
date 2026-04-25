// apps/backend/src/routes/subscription.ts
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';

const router = Router();

router.get('/limits', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: 'companyId requis' });
    }

    // Vérifier l'accès
    const membership = await prisma.companyMember.findUnique({
      where: {
        userId_companyId: {
          userId: decoded.userId,
          companyId: companyId as string
        }
      }
    });

    if (!membership) {
      return res.status(403).json({ error: 'Accès refusé' });
    }

    // Récupérer les compteurs actuels
    const [userCount, articleCount, invoiceCount] = await Promise.all([
      prisma.companyMember.count({
        where: { companyId: companyId as string, isActive: true }
      }),
      prisma.article.count({
        where: { companyId: companyId as string }
      }),
      prisma.invoice.count({
        where: { companyId: companyId as string }
      })
    ]);

    // Récupérer les limites du owner
    const company = await prisma.company.findUnique({
      where: { id: companyId as string },
      include: {
        owner: {
          select: {
            maxUsers: true,
            maxArticles: true,
            maxInvoices: true,
            maxStorage: true
          }
        }
      }
    });

    const limits = {
      users: {
        current: userCount,
        max: company?.owner.maxUsers || 5,
        exceeded: userCount >= (company?.owner.maxUsers || 5)
      },
      articles: {
        current: articleCount,
        max: company?.owner.maxArticles || 1000,
        exceeded: articleCount >= (company?.owner.maxArticles || 1000)
      },
      invoices: {
        current: invoiceCount,
        max: company?.owner.maxInvoices || 1000,
        exceeded: invoiceCount >= (company?.owner.maxInvoices || 1000)
      },
      storage: {
        max: company?.owner.maxStorage || 5,
        unit: 'GB'
      }
    };

    res.json({ limits });
  } catch (error) {
    console.error('Subscription limits error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

export default router;
// apps/backend/src/routes/companies.ts
import { Router } from 'express';
import { prisma } from '../index';

const router = Router();

// Recherche de companies (public - pour l'inscription)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string' || q.length < 2) {
      return res.json([]);
    }

    const companies = await prisma.company.findMany({
      where: {
        name: {
          contains: q,
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        logo: true,
        _count: {
          select: {
            members: {
              where: { isActive: true }
            }
          }
        }
      },
      take: 10,
      orderBy: {
        name: 'asc'
      }
    });

    // Formater la réponse
    const formattedCompanies = companies.map(company => ({
      id: company.id,
      name: company.name,
      logo: company.logo,
      memberCount: company._count.members
    }));

    res.json(formattedCompanies);
  } catch (error) {
    console.error('Company search error:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
});

export default router;
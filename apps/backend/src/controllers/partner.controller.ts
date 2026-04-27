// backend/src/routes/partner.routes.ts
import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';
import { Permission } from '@factura-mg/shared';

const router = Router();

// GET /api/partners - Liste tous les partenaires (clients + fournisseurs)
router.get('/', authenticate, authorize(Permission.VIEW_PARTNERS), async (req: AuthRequest, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      type, // 'client' ou 'supplier'
      isActive,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const companyId = req.user!.companyId;

    // Si type spécifié, filtrer par type
    if (type === 'client') {
      const where: any = { companyId };
      
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { code: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ];
      }
      
      if (isActive !== undefined) where.isActive = isActive === 'true';

      const [total, clients] = await prisma.$transaction([
        prisma.client.count({ where }),
        prisma.client.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      return res.json({
        success: true,
        data: clients.map(c => ({ ...c, type: 'client' })),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }

    if (type === 'supplier') {
      const where: any = { companyId };
      
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { code: { contains: search as string, mode: 'insensitive' } },
          { email: { contains: search as string, mode: 'insensitive' } },
        ];
      }
      
      if (isActive !== undefined) where.isActive = isActive === 'true';

      const [total, suppliers] = await prisma.$transaction([
        prisma.supplier.count({ where }),
        prisma.supplier.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      return res.json({
        success: true,
        data: suppliers.map(s => ({ ...s, type: 'supplier' })),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    }

    // Si pas de type, retourner les deux
    const clientWhere: any = { companyId };
    const supplierWhere: any = { companyId };

    if (search) {
      const searchFilter = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { code: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
      clientWhere.OR = searchFilter;
      supplierWhere.OR = searchFilter;
    }

    if (isActive !== undefined) {
      clientWhere.isActive = isActive === 'true';
      supplierWhere.isActive = isActive === 'true';
    }

    const [clients, suppliers] = await prisma.$transaction([
      prisma.client.findMany({ where: clientWhere, orderBy: { createdAt: 'desc' } }),
      prisma.supplier.findMany({ where: supplierWhere, orderBy: { createdAt: 'desc' } }),
    ]);

    const allPartners = [
      ...clients.map(c => ({ ...c, type: 'client' as const })),
      ...suppliers.map(s => ({ ...s, type: 'supplier' as const })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const paginatedData = allPartners.slice(skip, skip + limitNum);

    res.json({
      success: true,
      data: paginatedData,
      pagination: {
        total: allPartners.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(allPartners.length / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des partenaires' });
  }
});

// GET /api/partners/clients - Liste uniquement les clients
router.get('/clients', authenticate, authorize(Permission.VIEW_PARTNERS, Permission.VIEW_SUPPLIERS), async (req: AuthRequest, res) => {
  try {
    
    if (!req.user?.companyId) {
      return res.status(400).json({ message: 'Company ID manquant' });
    }
    const companyId = req.user!.companyId;

    const clients = await prisma.client.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: clients,
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des clients' });
  }
});

// GET /api/partners/fournisseurs - Liste uniquement les fournisseurs
router.get('/fournisseurs', authenticate, authorize(Permission.VIEW_PARTNERS), async (req: AuthRequest, res) => {
  try {
    if (!req.user?.companyId) {
      return res.status(400).json({ message: 'Company ID manquant' });
    }

    const companyId = req.user!.companyId;

    const suppliers = await prisma.supplier.findMany({
      where: { companyId, isActive: true },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: suppliers,
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des fournisseurs' });
  }
});

// GET /api/partners/:id - Détail d'un partenaire (client ou fournisseur)
router.get('/:id', authenticate, authorize(Permission.VIEW_PARTNERS), async (req: AuthRequest, res) => {
  try {

    if (!req.user?.companyId) {
      return res.status(400).json({ message: 'Company ID manquant' });
    }

    const { id } = req.params;
    const companyId = req.user!.companyId;

    // Essayer de trouver dans les clients
    const client = await prisma.client.findFirst({
      where: { id, companyId },
      include: {
        invoices: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        debts: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (client) {
      return res.json({
        success: true,
        data: { ...client, type: 'client' },
      });
    }

    // Sinon, chercher dans les fournisseurs
    const supplier = await prisma.supplier.findFirst({
      where: { id, companyId },
      include: {
        articles: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        debts: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (supplier) {
      return res.json({
        success: true,
        data: { ...supplier, type: 'supplier' },
      });
    }

    return res.status(404).json({ message: 'Partenaire non trouvé' });
  } catch (error) {
    console.error('Error fetching partner:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du partenaire' });
  }
});

// POST /api/partners - Créer un partenaire
router.post('/', authenticate, authorize(Permission.CREATE_PARTNERS), async (req: AuthRequest, res) => {
  try {
    const {
      code,
      name,
      email,
      phone,
      address,
      taxId,
      creditLimit,
      type, // 'client' ou 'supplier'
    } = req.body;

    if (!req.user?.companyId) {
      return res.status(400).json({ message: 'Company ID manquant' });
    }

    const companyId = req.user!.companyId;

    // Validation
    if (!code || !name || !type) {
      return res.status(400).json({
        message: 'Les champs code, nom et type sont requis',
      });
    }

    if (type !== 'client' && type !== 'supplier') {
      return res.status(400).json({
        message: 'Le type doit être "client" ou "supplier"',
      });
    }

    if (type === 'client') {
      // Vérifier unicité du code
      const existing = await prisma.client.findFirst({
        where: { code, companyId },
      });

      if (existing) {
        return res.status(409).json({ message: `Le code client "${code}" existe déjà` });
      }

      const client = await prisma.client.create({
        data: {
          code,
          name,
          email: email || null,
          phone: phone || null,
          address: address || null,
          taxId: taxId || null,
          creditLimit: creditLimit ? parseFloat(creditLimit) : null,
          companyId,
        },
      });

      return res.status(201).json({
        success: true,
        data: { ...client, type: 'client' },
        message: 'Client créé avec succès',
      });
    } else {
      // Vérifier unicité du code
      const existing = await prisma.supplier.findFirst({
        where: { code, companyId },
      });

      if (existing) {
        return res.status(409).json({ message: `Le code fournisseur "${code}" existe déjà` });
      }

      const supplier = await prisma.supplier.create({
        data: {
          code,
          name,
          email: email || null,
          phone: phone || null,
          address: address || null,
          taxId: taxId || null,
          companyId,
        },
      });

      return res.status(201).json({
        success: true,
        data: { ...supplier, type: 'supplier' },
        message: 'Fournisseur créé avec succès',
      });
    }
  } catch (error) {
    console.error('Error creating partner:', error);
    res.status(500).json({ message: 'Erreur lors de la création du partenaire' });
  }
});

// PUT /api/partners/:id - Modifier un partenaire
router.put('/:id', authenticate, authorize(Permission.EDIT_PARTNERS), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      name,
      email,
      phone,
      address,
      taxId,
      creditLimit,
      isActive,
    } = req.body;

    if (!req.user?.companyId) {
      return res.status(400).json({ message: 'Company ID manquant' });
    }

    const companyId = req.user!.companyId;

    // Essayer de mettre à jour un client
    const existingClient = await prisma.client.findFirst({
      where: { id, companyId },
    });

    if (existingClient) {
      // Vérifier unicité du code si changé
      if (code && code !== existingClient.code) {
        const codeConflict = await prisma.client.findFirst({
          where: {
            code,
            companyId,
            NOT: { id },
          },
        });
        if (codeConflict) {
          return res.status(409).json({ message: `Le code client "${code}" existe déjà` });
        }
      }

      const client = await prisma.client.update({
        where: { id },
        data: {
          ...(code !== undefined && { code }),
          ...(name !== undefined && { name }),
          ...(email !== undefined && { email: email || null }),
          ...(phone !== undefined && { phone: phone || null }),
          ...(address !== undefined && { address: address || null }),
          ...(taxId !== undefined && { taxId: taxId || null }),
          ...(creditLimit !== undefined && { creditLimit: creditLimit ? parseFloat(creditLimit) : null }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      return res.json({
        success: true,
        data: { ...client, type: 'client' },
        message: 'Client mis à jour avec succès',
      });
    }

    // Sinon, essayer de mettre à jour un fournisseur
    const existingSupplier = await prisma.supplier.findFirst({
      where: { id, companyId },
    });

    if (existingSupplier) {
      // Vérifier unicité du code si changé
      if (code && code !== existingSupplier.code) {
        const codeConflict = await prisma.supplier.findFirst({
          where: {
            code,
            companyId,
            NOT: { id },
          },
        });
        if (codeConflict) {
          return res.status(409).json({ message: `Le code fournisseur "${code}" existe déjà` });
        }
      }

      const supplier = await prisma.supplier.update({
        where: { id },
        data: {
          ...(code !== undefined && { code }),
          ...(name !== undefined && { name }),
          ...(email !== undefined && { email: email || null }),
          ...(phone !== undefined && { phone: phone || null }),
          ...(address !== undefined && { address: address || null }),
          ...(taxId !== undefined && { taxId: taxId || null }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      return res.json({
        success: true,
        data: { ...supplier, type: 'supplier' },
        message: 'Fournisseur mis à jour avec succès',
      });
    }

    return res.status(404).json({ message: 'Partenaire non trouvé' });
  } catch (error) {
    console.error('Error updating partner:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du partenaire' });
  }
});

// DELETE /api/partners/:id - Supprimer un partenaire
router.delete('/:id', authenticate, authorize(Permission.DELETE_PARTNERS), async (req: AuthRequest, res) => {
  try {

    if (!req.user?.companyId) {
      return res.status(400).json({ message: 'Company ID manquant' });
    }

    const { id } = req.params;
    const companyId = req.user!.companyId;

    // Essayer de supprimer un client
    const client = await prisma.client.findFirst({
      where: { id, companyId },
      include: {
        invoices: { take: 1 },
        debts: { take: 1 },
      },
    });

    if (client) {
      // Si utilisé dans des factures ou dettes, soft delete
      if (client.invoices.length > 0 || client.debts.length > 0) {
        await prisma.client.update({
          where: { id },
          data: { isActive: false },
        });
        return res.json({ 
          success: true,
          message: 'Client désactivé (utilisé dans des factures ou dettes)' 
        });
      }

      // Sinon, suppression complète
      await prisma.client.delete({ where: { id } });
      return res.json({ 
        success: true,
        message: 'Client supprimé avec succès' 
      });
    }

    // Essayer de supprimer un fournisseur
    const supplier = await prisma.supplier.findFirst({
      where: { id, companyId },
      include: {
        articles: { take: 1 },
        debts: { take: 1 },
      },
    });

    if (supplier) {
      // Si utilisé dans des articles ou dettes, soft delete
      if (supplier.articles.length > 0 || supplier.debts.length > 0) {
        await prisma.supplier.update({
          where: { id },
          data: { isActive: false },
        });
        return res.json({ 
          success: true,
          message: 'Fournisseur désactivé (utilisé dans des articles ou dettes)' 
        });
      }

      // Sinon, suppression complète
      await prisma.supplier.delete({ where: { id } });
      return res.json({ 
        success: true,
        message: 'Fournisseur supprimé avec succès' 
      });
    }

    return res.status(404).json({ message: 'Partenaire non trouvé' });
  } catch (error) {
    console.error('Error deleting partner:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du partenaire' });
  }
});

// Ajouter ces routes au fichier backend/src/routes/partner.routes.ts

// GET /api/clients/stats - Statistiques des clients
router.get('/clients/stats', authenticate, authorize(Permission.VIEW_PARTNERS), async (req: AuthRequest, res) => {
  try {

    if (!req.user?.companyId) {
      return res.status(400).json({ message: 'Company ID manquant' });
    }

    const companyId = req.user!.companyId;
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Tous les clients
    const allClients = await prisma.client.findMany({
      where: { companyId },
      include: {
        debts: true,
      },
    });

    // Clients actifs/inactifs
    const active = allClients.filter(c => c.isActive).length;
    const inactive = allClients.filter(c => !c.isActive).length;

    // Nouveaux ce mois
    const newThisMonth = allClients.filter(c => 
      new Date(c.createdAt) >= firstDayOfMonth
    ).length;

    // Nouveaux le mois dernier (pour le taux de croissance)
    const newLastMonth = allClients.filter(c => {
      const createdDate = new Date(c.createdAt);
      return createdDate >= firstDayOfLastMonth && createdDate <= lastDayOfLastMonth;
    }).length;

    // Taux de croissance
    const growthRate = newLastMonth > 0 
      ? Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100)
      : 0;

    // Crédit total
    const totalCredit = allClients.reduce((sum, c) => 
      sum + Number(c.creditLimit || 0), 0
    );

    // Dettes totales
    const totalDebt = allClients.reduce((sum, c) => {
      const clientDebt = c.debts.reduce((d, debt) => 
        d + Number(debt.amount || 0), 0
      );
      return sum + clientDebt;
    }, 0);

    res.json({
      success: true,
      data: {
        total: allClients.length,
        active,
        inactive,
        newThisMonth,
        totalCredit,
        totalDebt,
        growthRate,
      },
    });
  } catch (error) {
    console.error('Error fetching client stats:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
});

// GET /api/fournisseurs/stats - Statistiques des fournisseurs
router.get('/fournisseurs/stats', authenticate, authorize(Permission.VIEW_PARTNERS), async (req: AuthRequest, res) => {
  try {

    if (!req.user?.companyId) {
      return res.status(400).json({ message: 'Company ID manquant' });
    }

    const companyId = req.user!.companyId;
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Tous les fournisseurs
    const allSuppliers = await prisma.supplier.findMany({
      where: { companyId },
      include: {
        debts: true,
      },
    });

    // Fournisseurs actifs/inactifs
    const active = allSuppliers.filter(s => s.isActive).length;
    const inactive = allSuppliers.filter(s => !s.isActive).length;

    // Nouveaux ce mois
    const newThisMonth = allSuppliers.filter(s => 
      new Date(s.createdAt) >= firstDayOfMonth
    ).length;

    // Nouveaux le mois dernier
    const newLastMonth = allSuppliers.filter(s => {
      const createdDate = new Date(s.createdAt);
      return createdDate >= firstDayOfLastMonth && createdDate <= lastDayOfLastMonth;
    }).length;

    // Taux de croissance
    const growthRate = newLastMonth > 0 
      ? Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100)
      : 0;

    // Dettes totales (ce qu'on doit aux fournisseurs)
    const totalDebt = allSuppliers.reduce((sum, s) => {
      const supplierDebt = s.debts.reduce((d, debt) => 
        d + Number(debt.amount || 0), 0
      );
      return sum + supplierDebt;
    }, 0);

    res.json({
      success: true,
      data: {
        total: allSuppliers.length,
        active,
        inactive,
        newThisMonth,
        totalCredit: 0, // Pas de crédit pour les fournisseurs
        totalDebt,
        growthRate,
      },
    });
  } catch (error) {
    console.error('Error fetching supplier stats:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
});

// GET /api/clients/top - Top clients
router.get('/clients/top', authenticate, authorize(Permission.VIEW_PARTNERS), async (req: AuthRequest, res) => {
  try {

    if (!req.user?.companyId) {
      return res.status(400).json({ message: 'Company ID manquant' });
    }

    const companyId = req.user!.companyId;
    const { limit = '5' } = req.query;
    const limitNum = parseInt(limit as string);

    const clients = await prisma.client.findMany({
      where: { companyId, isActive: true },
      include: {
        invoices: {
          select: {
            total: true,
          },
        },
      },
    });

    // Calculer le total des factures pour chaque client
    const clientsWithTotal = clients.map(client => {
      const totalAmount = client.invoices.reduce((sum, inv) => 
        sum + Number(inv.total || 0), 0
      );
      return {
        id: client.id,
        name: client.name,
        code: client.code,
        totalAmount,
        invoiceCount: client.invoices.length,
        lastActivity: client.updatedAt.toISOString(),
      };
    });

    // Trier par montant total décroissant
    const topClients = clientsWithTotal
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, limitNum);

    res.json({
      success: true,
      data: topClients,
    });
  } catch (error) {
    console.error('Error fetching top clients:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des top clients' });
  }
});

// GET /api/fournisseurs/top - Top fournisseurs
router.get('/fournisseurs/top', authenticate, authorize(Permission.VIEW_PARTNERS), async (req: AuthRequest, res) => {
  try {

    if (!req.user?.companyId) {
      return res.status(400).json({ message: 'Company ID manquant' });
    }

    const companyId = req.user!.companyId;
    const { limit = '5' } = req.query;
    const limitNum = parseInt(limit as string);

    const suppliers = await prisma.supplier.findMany({
      where: { companyId, isActive: true },
      include: {
        articles: {
          select: {
            purchasePrice: true,
          },
        },
      },
    });

    // Calculer le total basé sur les articles
    const suppliersWithTotal = suppliers.map(supplier => {
      const totalAmount = supplier.articles.reduce((sum, article) => 
        sum + Number(article.purchasePrice || 0), 0
      );
      return {
        id: supplier.id,
        name: supplier.name,
        code: supplier.code,
        totalAmount,
        invoiceCount: supplier.articles.length, // Nombre d'articles fournis
        lastActivity: supplier.updatedAt.toISOString(),
      };
    });

    // Trier par montant total décroissant
    const topSuppliers = suppliersWithTotal
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, limitNum);

    res.json({
      success: true,
      data: topSuppliers,
    });
  } catch (error) {
    console.error('Error fetching top suppliers:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des top fournisseurs' });
  }
});

// PATCH /api/clients/bulk-update - Mise à jour en masse des clients
router.patch('/clients/bulk-update', authenticate, authorize(Permission.EDIT_PARTNERS), async (req: AuthRequest, res) => {
  try {

    if (!req.user?.companyId) {
      return res.status(400).json({ message: 'Company ID manquant' });
    }

    const { ids, isActive } = req.body;
    const companyId = req.user!.companyId;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'IDs requis' });
    }

    if (isActive === undefined) {
      return res.status(400).json({ message: 'isActive requis' });
    }

    // Mise à jour en masse
    const result = await prisma.client.updateMany({
      where: {
        id: { in: ids },
        companyId, // Sécurité : ne mettre à jour que les clients de l'entreprise
      },
      data: {
        isActive: Boolean(isActive),
      },
    });

    res.json({
      success: true,
      data: { count: result.count },
      message: `${result.count} client(s) mis à jour`,
    });
  } catch (error) {
    console.error('Error bulk updating clients:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour en masse' });
  }
});

// PATCH /api/fournisseurs/bulk-update - Mise à jour en masse des fournisseurs
router.patch('/fournisseurs/bulk-update', authenticate, authorize(Permission.EDIT_PARTNERS), async (req: AuthRequest, res) => {
  try {

    if (!req.user?.companyId) {
      return res.status(400).json({ message: 'Company ID manquant' });
    }

    const { ids, isActive } = req.body;
    const companyId = req.user!.companyId;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'IDs requis' });
    }

    if (isActive === undefined) {
      return res.status(400).json({ message: 'isActive requis' });
    }

    // Mise à jour en masse
    const result = await prisma.supplier.updateMany({
      where: {
        id: { in: ids },
        companyId,
      },
      data: {
        isActive: Boolean(isActive),
      },
    });

    res.json({
      success: true,
      data: { count: result.count },
      message: `${result.count} fournisseur(s) mis à jour`,
    });
  } catch (error) {
    console.error('Error bulk updating suppliers:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour en masse' });
  }
});

// DELETE /api/clients/bulk-delete - Suppression en masse des clients
router.delete('/clients/bulk-delete', authenticate, authorize(Permission.DELETE_PARTNERS), async (req: AuthRequest, res) => {
  try {

    if (!req.user?.companyId) {
      return res.status(400).json({ message: 'Company ID manquant' });
    }

    const { ids } = req.body;
    const companyId = req.user!.companyId;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'IDs requis' });
    }

    // Vérifier si les clients sont utilisés
    const clients = await prisma.client.findMany({
      where: {
        id: { in: ids },
        companyId,
      },
      include: {
        invoices: { take: 1 },
        debts: { take: 1 },
      },
    });

    let deletedCount = 0;
    let deactivatedCount = 0;

    for (const client of clients) {
      if (client.invoices.length > 0 || client.debts.length > 0) {
        // Soft delete si utilisé
        await prisma.client.update({
          where: { id: client.id },
          data: { isActive: false },
        });
        deactivatedCount++;
      } else {
        // Suppression complète si non utilisé
        await prisma.client.delete({
          where: { id: client.id },
        });
        deletedCount++;
      }
    }

    res.json({
      success: true,
      data: { deletedCount, deactivatedCount },
      message: `${deletedCount} client(s) supprimé(s), ${deactivatedCount} désactivé(s)`,
    });
  } catch (error) {
    console.error('Error bulk deleting clients:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression en masse' });
  }
});

// DELETE /api/fournisseurs/bulk-delete - Suppression en masse des fournisseurs
router.delete('/fournisseurs/bulk-delete', authenticate, authorize(Permission.DELETE_PARTNERS), async (req: AuthRequest, res) => {
  try {

    if (!req.user?.companyId) {
      return res.status(400).json({ message: 'Company ID manquant' });
    }
    
    const { ids } = req.body;
    const companyId = req.user!.companyId;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'IDs requis' });
    }

    // Vérifier si les fournisseurs sont utilisés
    const suppliers = await prisma.supplier.findMany({
      where: {
        id: { in: ids },
        companyId,
      },
      include: {
        articles: { take: 1 },
        debts: { take: 1 },
      },
    });

    let deletedCount = 0;
    let deactivatedCount = 0;

    for (const supplier of suppliers) {
      if (supplier.articles.length > 0 || supplier.debts.length > 0) {
        // Soft delete si utilisé
        await prisma.supplier.update({
          where: { id: supplier.id },
          data: { isActive: false },
        });
        deactivatedCount++;
      } else {
        // Suppression complète si non utilisé
        await prisma.supplier.delete({
          where: { id: supplier.id },
        });
        deletedCount++;
      }
    }

    res.json({
      success: true,
      data: { deletedCount, deactivatedCount },
      message: `${deletedCount} fournisseur(s) supprimé(s), ${deactivatedCount} désactivé(s)`,
    });
  } catch (error) {
    console.error('Error bulk deleting suppliers:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression en masse' });
  }
});

export default router;
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
router.get('/clients', authenticate, authorize(Permission.VIEW_PARTNERS), async (req: AuthRequest, res) => {
  try {
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

// GET /api/partners/suppliers - Liste uniquement les fournisseurs
router.get('/suppliers', authenticate, authorize(Permission.VIEW_PARTNERS), async (req: AuthRequest, res) => {
  try {
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

export default router;
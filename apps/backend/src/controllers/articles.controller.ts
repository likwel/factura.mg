import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, authorize, AuthRequest } from '../middleware/auth.middleware';
import { Permission } from '@factura-mg/shared';

const router = Router();

// GET / - Liste tous les articles avec filtres et pagination
router.get('/', authenticate, authorize(Permission.VIEW_ARTICLES), async (req: AuthRequest, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      categoryId,
      supplierId,
      isActive,
      lowStock,
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      companyId: req.user!.companyId,
    };

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { code: { contains: search as string, mode: 'insensitive' } },
        { barcode: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (categoryId) where.categoryId = categoryId as string;
    if (supplierId) where.supplierId = supplierId as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    // Filtre stock bas : currentStock <= stockMin
    if (lowStock === 'true') {
      where.AND = [
        { currentStock: { lte: prisma.article.fields.stockMin } },
      ];
      // Prisma ne supporte pas la comparaison de colonnes directement, on utilise une raw query ou une approche alternative
      delete where.AND;
      // On récupérera et filtrera en mémoire pour lowStock
    }

    const [total, articles] = await prisma.$transaction([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        include: {
          category: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true, code: true } },
          warehouseStock: {
            include: {
              warehouse: { select: { id: true, name: true } },
            },
          },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Filtrage lowStock en mémoire si demandé
    const filteredArticles =
      lowStock === 'true'
        ? articles.filter((a) => a.currentStock <= a.stockMin)
        : articles;

    res.json({
      data: filteredArticles,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des articles' });
  }
});

// GET /:id - Détail d'un article
router.get('/:id', authenticate, authorize(Permission.VIEW_ARTICLES), async (req: AuthRequest, res) => {
  try {
    const article = await prisma.article.findFirst({
      where: {
        id: req.params.id,
        companyId: req.user!.companyId,
      },
      include: {
        category: true,
        supplier: true,
        warehouseStock: {
          include: { warehouse: true },
        },
        stockMovements: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, firstName: true, lastName: true } },
            warehouse: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    res.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'article' });
  }
});

// POST / - Créer un article
router.post('/', authenticate, authorize(Permission.CREATE_ARTICLES), async (req: AuthRequest, res) => {
  try {
    const {
      code,
      name,
      description,
      purchasePrice,
      sellingPrice,
      stockMin,
      stockMax,
      currentStock,
      unit,
      barcode,
      image,
      categoryId,
      supplierId,
      isActive,
    } = req.body;

    // Validation des champs requis
    if (!code || !name || purchasePrice === undefined || sellingPrice === undefined) {
      return res.status(400).json({
        message: 'Les champs code, nom, prix d\'achat et prix de vente sont requis',
      });
    }

    // Vérifier que le code est unique dans la company
    const existing = await prisma.article.findFirst({
      where: { code, companyId: req.user!.companyId },
    });

    if (existing) {
      return res.status(409).json({ message: `Le code article "${code}" existe déjà` });
    }

    // Vérifier la limite d'articles du plan
    const company = await prisma.company.findUnique({
      where: { id: req.user!.companyId },
      select: { maxArticles: true, _count: { select: { articles: true } } },
    });

    if (company && company._count.articles >= company.maxArticles) {
      return res.status(403).json({
        message: `Limite d'articles atteinte (${company.maxArticles}). Veuillez mettre à niveau votre abonnement.`,
      });
    }

    const article = await prisma.article.create({
      data: {
        code,
        name,
        description,
        purchasePrice,
        sellingPrice,
        stockMin: stockMin ?? 0,
        stockMax,
        currentStock: currentStock ?? 0,
        unit,
        barcode,
        image,
        categoryId: categoryId || null,
        supplierId: supplierId || null,
        isActive: isActive ?? true,
        companyId: req.user!.companyId,
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    res.status(201).json(article);
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'article' });
  }
});

// PUT /:id - Modifier un article
router.put('/:id', authenticate, authorize(Permission.EDIT_ARTICLES), async (req: AuthRequest, res) => {
  try {
    const {
      code,
      name,
      description,
      purchasePrice,
      sellingPrice,
      stockMin,
      stockMax,
      unit,
      barcode,
      image,
      categoryId,
      supplierId,
      isActive,
    } = req.body;

    // Vérifier que l'article appartient à la company
    const existing = await prisma.article.findFirst({
      where: { id: req.params.id, companyId: req.user!.companyId },
    });

    if (!existing) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    // Si le code change, vérifier l'unicité
    if (code && code !== existing.code) {
      const codeConflict = await prisma.article.findFirst({
        where: {
          code,
          companyId: req.user!.companyId,
          NOT: { id: req.params.id },
        },
      });
      if (codeConflict) {
        return res.status(409).json({ message: `Le code article "${code}" existe déjà` });
      }
    }

    const article = await prisma.article.update({
      where: { id: req.params.id },
      data: {
        ...(code !== undefined && { code }),
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(purchasePrice !== undefined && { purchasePrice }),
        ...(sellingPrice !== undefined && { sellingPrice }),
        ...(stockMin !== undefined && { stockMin }),
        ...(stockMax !== undefined && { stockMax }),
        ...(unit !== undefined && { unit }),
        ...(barcode !== undefined && { barcode }),
        ...(image !== undefined && { image }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(supplierId !== undefined && { supplierId: supplierId || null }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    res.json(article);
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'article' });
  }
});

// DELETE /:id - Supprimer un article (soft delete via isActive)
router.delete('/:id', authenticate, authorize(Permission.DELETE_ARTICLES), async (req: AuthRequest, res) => {
  try {
    const article = await prisma.article.findFirst({
      where: { id: req.params.id, companyId: req.user!.companyId },
      include: {
        invoiceItems: { take: 1 },
        stockMovements: { take: 1 },
      },
    });

    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    // Si l'article est utilisé dans des factures, on fait un soft delete
    if (article.invoiceItems.length > 0 || article.stockMovements.length > 0) {
      await prisma.article.update({
        where: { id: req.params.id },
        data: { isActive: false },
      });
      return res.json({ message: 'Article désactivé (utilisé dans des factures ou mouvements de stock)' });
    }

    // Sinon, suppression complète
    await prisma.article.delete({ where: { id: req.params.id } });
    res.json({ message: 'Article supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'article' });
  }
});

// POST /:id/stock-movement - Ajouter un mouvement de stock
router.post('/:id/stock-movement', authenticate, authorize(Permission.MANAGE_STOCK), async (req: AuthRequest, res) => {
  try {
    const { warehouseId, quantity, type, reference, notes } = req.body;

    if (!warehouseId || !quantity || !type) {
      return res.status(400).json({ message: 'warehouseId, quantity et type sont requis' });
    }

    const validTypes = ['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT', 'RETURN'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: `Type invalide. Valeurs acceptées: ${validTypes.join(', ')}` });
    }

    const article = await prisma.article.findFirst({
      where: { id: req.params.id, companyId: req.user!.companyId },
    });

    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    const warehouse = await prisma.warehouse.findFirst({
      where: { id: warehouseId, companyId: req.user!.companyId },
    });

    if (!warehouse) {
      return res.status(404).json({ message: 'Entrepôt non trouvé' });
    }

    // Vérifier le stock disponible pour les sorties
    if (['OUT', 'TRANSFER'].includes(type) && article.currentStock < quantity) {
      return res.status(400).json({
        message: `Stock insuffisant. Stock actuel: ${article.currentStock}, quantité demandée: ${quantity}`,
      });
    }

    // Calculer le nouveau stock global
    const stockDelta = ['IN', 'RETURN'].includes(type) ? quantity : -quantity;
    if (type === 'ADJUSTMENT') {
      // Pour un ajustement, quantity représente la nouvelle valeur absolue
    }

    const [movement] = await prisma.$transaction(async (tx) => {
      // Créer le mouvement
      const movement = await tx.stockMovement.create({
        data: {
          articleId: req.params.id,
          warehouseId,
          userId: req.user!.id,
          quantity,
          type,
          reference,
          notes,
        },
        include: {
          warehouse: { select: { id: true, name: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      // Mettre à jour le stock global de l'article
      const newStock =
        type === 'ADJUSTMENT'
          ? quantity
          : article.currentStock + stockDelta;

      await tx.article.update({
        where: { id: req.params.id },
        data: { currentStock: newStock },
      });

      // Mettre à jour ou créer le stock par entrepôt
      await tx.warehouseStock.upsert({
        where: { warehouseId_articleId: { warehouseId, articleId: req.params.id } },
        update: {
          quantity:
            type === 'ADJUSTMENT'
              ? quantity
              : { increment: stockDelta },
        },
        create: {
          warehouseId,
          articleId: req.params.id,
          quantity: type === 'ADJUSTMENT' ? quantity : Math.max(0, stockDelta),
        },
      });

      return [movement];
    });

    res.status(201).json(movement);
  } catch (error) {
    console.error('Error creating stock movement:', error);
    res.status(500).json({ message: 'Erreur lors du mouvement de stock' });
  }
});

// GET /:id/stock-movements - Historique des mouvements de stock
router.get('/:id/stock-movements', authenticate, authorize(Permission.VIEW_ARTICLES), async (req: AuthRequest, res) => {
  try {
    const { page = '1', limit = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const article = await prisma.article.findFirst({
      where: { id: req.params.id, companyId: req.user!.companyId },
    });

    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    const [total, movements] = await prisma.$transaction([
      prisma.stockMovement.count({ where: { articleId: req.params.id } }),
      prisma.stockMovement.findMany({
        where: { articleId: req.params.id },
        include: {
          warehouse: { select: { id: true, name: true } },
          user: { select: { id: true, firstName: true, lastName: true } },
        },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    res.json({
      data: movements,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des mouvements de stock' });
  }
});

// GET /stats/summary - Résumé statistique des articles
router.get('/stats/summary', authenticate, authorize(Permission.VIEW_ARTICLES), async (req: AuthRequest, res) => {
  try {
    const companyId = req.user!.companyId;

    const [total, active, lowStock, outOfStock] = await Promise.all([
      prisma.article.count({ where: { companyId } }),
      prisma.article.count({ where: { companyId, isActive: true } }),
      prisma.article.findMany({
        where: { companyId, isActive: true },
        select: { id: true, currentStock: true, stockMin: true },
      }),
      prisma.article.count({ where: { companyId, currentStock: 0 } }),
    ]);

    const lowStockCount = lowStock.filter((a) => a.currentStock <= a.stockMin && a.currentStock > 0).length;

    const stockValue = await prisma.article.aggregate({
      where: { companyId, isActive: true },
      _sum: { currentStock: true },
    });

    // Valeur du stock = sum(currentStock * purchasePrice)
    const articles = await prisma.article.findMany({
      where: { companyId, isActive: true },
      select: { currentStock: true, purchasePrice: true, sellingPrice: true },
    });

    const totalPurchaseValue = articles.reduce(
      (acc, a) => acc + a.currentStock * Number(a.purchasePrice),
      0
    );
    const totalSellingValue = articles.reduce(
      (acc, a) => acc + a.currentStock * Number(a.sellingPrice),
      0
    );

    res.json({
      total,
      active,
      inactive: total - active,
      lowStock: lowStockCount,
      outOfStock,
      totalUnits: stockValue._sum.currentStock ?? 0,
      totalPurchaseValue: totalPurchaseValue.toFixed(2),
      totalSellingValue: totalSellingValue.toFixed(2),
      potentialMargin: (totalSellingValue - totalPurchaseValue).toFixed(2),
    });
  } catch (error) {
    console.error('Error fetching article stats:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
});

export default router;
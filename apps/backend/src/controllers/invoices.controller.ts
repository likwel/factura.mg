import { Router, Request, Response } from 'express';
import { PrismaClient, InvoiceStatus, Prisma, DocumentType } from '@prisma/client';
import { authenticate }                from '../middleware/auth.middleware';
import { requireCompany }              from '../middleware/company.middleware';
import { previewNextNumber, generateNextNumber } from '../services/numbering.service';

const router = Router();
const prisma = new PrismaClient();

router.use(authenticate);
router.use(requireCompany);

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function computeNextDate(from: Date, interval: string): Date {
  const d = new Date(from);
  switch (interval) {
    case 'WEEKLY':    d.setDate(d.getDate() + 7);         break;
    case 'MONTHLY':   d.setMonth(d.getMonth() + 1);       break;
    case 'QUARTERLY': d.setMonth(d.getMonth() + 3);       break;
    case 'YEARLY':    d.setFullYear(d.getFullYear() + 1); break;
  }
  return d;
}

const invoiceInclude = {
  client:   { select: { id: true, name: true, email: true, phone: true, address: true } },
  supplier: { select: { id: true, name: true, email: true, phone: true, address: true } },
  user:     { select: { id: true, firstName: true, lastName: true, email: true } },
  items:    { include: { article: { select: { id: true, code: true, name: true, unit: true } } } },
} satisfies Prisma.InvoiceInclude;

// Guard companyId — évite la répétition dans chaque route
function getCompanyId(req: Request, res: Response): string | null {
  const id = req.user?.companyId;
  if (!id) { res.status(400).json({ message: 'Company ID manquant' }); return null; }
  return id;
}

// ─────────────────────────────────────────────────────────────
// ██  ROUTES STATIQUES — toujours AVANT /:id
// ─────────────────────────────────────────────────────────────

// GET /invoices
router.get('/', async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req, res); if (!companyId) return;

    const {
      page = '1', limit = '10', search = '',
      status, clientId, supplierId, type,
      startDate, endDate, isRecurring,
      sortBy = 'createdAt', sortOrder = 'desc',
    } = req.query as Record<string, string>;

    const where: Prisma.InvoiceWhereInput = {
      companyId,
      ...(status      && { status: status as InvoiceStatus }),
      ...(type        && { type: type as DocumentType }),
      ...(clientId    && { clientId }),
      ...(supplierId  && { supplierId }),
      ...(isRecurring !== undefined && { isRecurring: isRecurring === 'true' }),
      ...(startDate || endDate ? {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate   && { lte: new Date(endDate) }),
        },
      } : {}),
      ...(search && {
        OR: [
          { invoiceNumber: { contains: search, mode: 'insensitive' } },
          { client:   { name: { contains: search, mode: 'insensitive' } } },
          { supplier: { name: { contains: search, mode: 'insensitive' } } },
          { notes:    { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where, skip, take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          client:   { select: { id: true, name: true, email: true } },
          supplier: { select: { id: true, name: true, email: true } },
          user:     { select: { id: true, firstName: true, lastName: true } },
          _count:   { select: { items: true } },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    res.json({ data: invoices, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error('GET /invoices:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des factures' });
  }
});

// GET /invoices/next-number?type=INVOICE
router.get('/next-number', async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req, res); if (!companyId) return;
    const docType   = (req.query.type as DocumentType) ?? 'INVOICE';
    const number    = await previewNextNumber(companyId, docType);
    res.json({ number });
  } catch (err) {
    console.error('GET /next-number:', err);
    res.status(500).json({ error: 'Erreur de génération du numéro' });
  }
});

// GET /invoices/numbering
router.get('/numbering', async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req, res); if (!companyId) return;
    const configs = await prisma.numberingConfig.findMany({ where: { companyId } });
    res.json(configs);
  } catch (err) {
    res.status(500).json({ error: 'Erreur' });
  }
});

// PUT /invoices/numbering/:docType
router.put('/numbering/:docType', async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req, res); if (!companyId) return;
    const docType   = req.params.docType as DocumentType;
    const { prefix, separator, includeYear, yearFormat, includeMonth, padding, resetPeriod } = req.body;

    const config = await prisma.numberingConfig.upsert({
      where:  { companyId_docType: { companyId, docType } },
      update: { prefix, separator, includeYear, yearFormat, includeMonth, padding, resetPeriod },
      create: { companyId, docType, prefix, separator, includeYear, yearFormat, includeMonth, padding, resetPeriod, currentSeq: 0 },
    });
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: 'Erreur de mise à jour' });
  }
});

// GET /invoices/stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req, res); if (!companyId) return;
    const { startDate, endDate } = req.query as Record<string, string>;

    const dateFilter: Prisma.InvoiceWhereInput = startDate || endDate ? {
      createdAt: {
        ...(startDate && { gte: new Date(startDate) }),
        ...(endDate   && { lte: new Date(endDate) }),
      },
    } : {};

    const [totals, byStatus, byType, overdueCount, recurringCount] = await Promise.all([
      prisma.invoice.aggregate({
        where: { companyId, ...dateFilter },
        _sum: { total: true }, _avg: { total: true }, _count: { id: true },
      }),
      prisma.invoice.groupBy({
        by: ['status'], where: { companyId, ...dateFilter },
        _count: { id: true }, _sum: { total: true },
      }),
      prisma.invoice.groupBy({
        by: ['type'], where: { companyId, ...dateFilter },
        _count: { id: true },
      }),
      prisma.invoice.count({ where: { companyId, status: 'OVERDUE', dueDate: { lt: new Date() } } }),
      prisma.invoice.count({ where: { companyId, isRecurring: true, status: { not: 'CANCELLED' } } }),
    ]);

    res.json({
      total:    Number(totals._sum.total ?? 0),
      average:  Number(totals._avg.total ?? 0),
      count:    totals._count.id,
      overdueCount, recurringCount,
      byStatus: byStatus.map(s => ({ status: s.status, count: s._count.id, total: Number(s._sum.total ?? 0) })),
      byType:   byType.map(t => ({ type: t.type, count: t._count.id })),
    });
  } catch (err) {
    console.error('GET /stats:', err);
    res.status(500).json({ error: 'Erreur lors du calcul des statistiques' });
  }
});

// GET /invoices/recurring
router.get('/recurring', async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req, res); if (!companyId) return;
    const invoices = await prisma.invoice.findMany({
      where: {
        companyId, isRecurring: true,
        status: { not: 'CANCELLED' },
        nextRecurringDate: { lte: new Date() },
        OR: [{ recurringEndDate: null }, { recurringEndDate: { gte: new Date() } }],
      },
      include: invoiceInclude,
    });
    res.json({ data: invoices, count: invoices.length });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des factures récurrentes' });
  }
});

// ─────────────────────────────────────────────────────────────
// ██  ROUTES DYNAMIQUES — après les routes statiques
// ─────────────────────────────────────────────────────────────

// GET /invoices/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req, res); if (!companyId) return;
    const invoice = await prisma.invoice.findFirst({
      where: { id: req.params.id, companyId },
      include: invoiceInclude,
    });
    if (!invoice) return res.status(404).json({ error: 'Facture non trouvée' });
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération de la facture' });
  }
});

// POST /invoices
router.post('/', async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req, res); if (!companyId) return;
    const userId    = req.user!.id;

    const {
      type = 'INVOICE', invoiceNumber, clientId, supplierId,
      status = 'DRAFT', date, dueDate, deliveryDate, validUntil,
      notes, internalNotes, discount = 0, tax = 0, items = [],
      parentInvoiceId,
      isRecurring = false, recurringInterval, recurringEndDate,
    } = req.body;

    // Validation partenaire selon le type
    const supplierTypes: DocumentType[] = ['PURCHASE_ORDER', 'SUPPLIER_INVOICE', 'RECEIPT_NOTE'];
    const isSupplierDoc = supplierTypes.includes(type);

    if (isSupplierDoc && !supplierId)
      return res.status(400).json({ error: 'Le fournisseur est requis pour ce type de document' });
    if (!isSupplierDoc && !clientId)
      return res.status(400).json({ error: 'Le client est requis pour ce type de document' });
    if (!items?.length)
      return res.status(400).json({ error: 'Au moins une ligne est requise' });
    if (isRecurring && !recurringInterval)
      return res.status(400).json({ error: "L'intervalle est requis pour une facture récurrente" });

    // Calcul totaux
    let subtotal = 0;
    const computedItems = items.map((it: any) => {
      const lineTotal = it.quantity * it.unitPrice * (1 - (it.discount ?? 0) / 100);
      subtotal += lineTotal;
      return { ...it, total: lineTotal };
    });
    const discountAmt = subtotal * (discount / 100);
    const after       = subtotal - discountAmt;
    const taxAmt      = after   * (tax / 100);
    const total       = after   + taxAmt;

    // Numéro via config DB (incrémente la séquence)
    const finalNumber = invoiceNumber || await generateNextNumber(companyId, type as DocumentType);

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: finalNumber,
        type:          type as DocumentType,
        companyId,
        userId,
        clientId:   !isSupplierDoc ? clientId   : null,
        supplierId: isSupplierDoc  ? supplierId  : null,
        status,
        subtotal,
        discount,
        tax:     taxAmt,
        total,
        notes,
        internalNotes,
        date:          date          ? new Date(date)          : new Date(),
        dueDate:       dueDate       ? new Date(dueDate)       : null,
        deliveryDate:  deliveryDate  ? new Date(deliveryDate)  : null,
        validUntil:    validUntil    ? new Date(validUntil)    : null,
        parentInvoiceId: parentInvoiceId ?? null,
        isRecurring,
        recurringInterval:  isRecurring ? recurringInterval : null,
        recurringEndDate:   isRecurring && recurringEndDate ? new Date(recurringEndDate) : null,
        nextRecurringDate:  isRecurring ? computeNextDate(new Date(), recurringInterval) : null,
        items: {
          create: computedItems.map((it: any) => ({
            articleId: it.articleId,
            quantity:  it.quantity,
            unitPrice: it.unitPrice,
            discount:  it.discount ?? 0,
            tax:       it.tax      ?? 0,
            total:     it.total,
          })),
        },
      },
      include: invoiceInclude,
    });

    // Transaction comptable auto si PAID
    if (status === 'PAID') {
      await prisma.transaction.create({
        data: {
          companyId, type: 'INCOME', amount: total,
          description: `Paiement ${finalNumber}`,
          invoiceId: invoice.id, date: new Date(),
        },
      });
    }

    res.status(201).json(invoice);
  } catch (err: any) {
    console.error('POST /invoices:', err);
    if (err.code === 'P2002') return res.status(409).json({ error: 'Ce numéro de facture existe déjà' });
    res.status(500).json({ error: 'Erreur lors de la création de la facture' });
  }
});

// PUT /invoices/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req, res); if (!companyId) return;
    const existing  = await prisma.invoice.findFirst({ where: { id: req.params.id, companyId } });
    if (!existing) return res.status(404).json({ error: 'Facture non trouvée' });
    if (['PAID','CANCELLED'].includes(existing.status))
      return res.status(403).json({ error: 'Une facture payée ou annulée ne peut pas être modifiée' });

    const {
      clientId, supplierId, dueDate, deliveryDate, validUntil,
      notes, internalNotes, discount = 0, tax = 0, items = [],
      isRecurring, recurringInterval, recurringEndDate,
    } = req.body;

    let subtotal = 0;
    const computedItems = items.map((it: any) => {
      const lineTotal = it.quantity * it.unitPrice * (1 - (it.discount ?? 0) / 100);
      subtotal += lineTotal;
      return { ...it, total: lineTotal };
    });
    const taxAmt = (subtotal - subtotal * (discount / 100)) * (tax / 100);
    const total  = subtotal - subtotal * (discount / 100) + taxAmt;

    await prisma.invoiceItem.deleteMany({ where: { invoiceId: req.params.id } });

    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: {
        clientId:   clientId   ?? null,
        supplierId: supplierId ?? null,
        subtotal, discount, tax: taxAmt, total,
        notes, internalNotes,
        dueDate:      dueDate      ? new Date(dueDate)      : null,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        validUntil:   validUntil   ? new Date(validUntil)   : null,
        isRecurring,
        recurringInterval:  isRecurring ? recurringInterval : null,
        recurringEndDate:   isRecurring && recurringEndDate ? new Date(recurringEndDate) : null,
        nextRecurringDate:  isRecurring ? computeNextDate(existing.nextRecurringDate ?? new Date(), recurringInterval) : null,
        items: {
          create: computedItems.map((it: any) => ({
            articleId: it.articleId, quantity: it.quantity,
            unitPrice: it.unitPrice, discount: it.discount ?? 0,
            tax: it.tax ?? 0, total: it.total,
          })),
        },
      },
      include: invoiceInclude,
    });

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// PATCH /invoices/:id/status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req, res); if (!companyId) return;
    const { status, paidDate } = req.body;

    const validStatuses: InvoiceStatus[] = [
      'DRAFT', 'PENDING', 'VALIDATED', 'SENT',
      'PARTIAL', 'COMPLETED', 'PAID', 'OVERDUE',  // ← ajoutés
      'CANCELLED', 'EXPIRED',
    ];

    if (!validStatuses.includes(status))
      return res.status(400).json({ error: `Statut invalide. Valeurs : ${validStatuses.join(', ')}` });

    const existing = await prisma.invoice.findFirst({ where: { id: req.params.id, companyId } });
    if (!existing) return res.status(404).json({ error: 'Facture non trouvée' });

    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: { status, paidDate: status === 'PAID' ? (paidDate ? new Date(paidDate) : new Date()) : null },
      include: invoiceInclude,
    });

    if (status === 'PAID' && existing.status !== 'PAID') {
      await prisma.transaction.create({
        data: {
          companyId, type: 'INCOME', amount: existing.total,
          description: `Paiement ${existing.invoiceNumber}`,
          invoiceId: req.params.id, date: new Date(),
        },
      });
    }

    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors du changement de statut' });
  }
});

// POST /invoices/:id/convert
router.post('/:id/convert', async (req: Request, res: Response) => {
  try {
    const companyId  = getCompanyId(req, res); if (!companyId) return;
    const { targetType } = req.body as { targetType: DocumentType };
    const source = await prisma.invoice.findFirst({
      where: { id: req.params.id, companyId }, include: { items: true },
    });
    if (!source) return res.status(404).json({ error: 'Facture non trouvée' });

    const newNumber = await generateNextNumber(companyId, targetType);
    const invoice   = await prisma.invoice.create({
      data: {
        invoiceNumber:  newNumber,
        type:           targetType,
        companyId,
        userId:         source.userId,
        clientId:       source.clientId,
        supplierId:     source.supplierId,
        status:         'DRAFT',
        subtotal:       source.subtotal,
        discount:       source.discount,
        tax:            source.tax,
        total:          source.total,
        notes:          source.notes,
        parentInvoiceId: source.id,
        isRecurring:    false,
        items: {
          create: source.items.map(it => ({
            articleId: it.articleId, quantity: it.quantity,
            unitPrice: it.unitPrice, discount: it.discount,
            tax: it.tax, total: it.total,
          })),
        },
      },
      include: invoiceInclude,
    });
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la conversion' });
  }
});

// POST /invoices/:id/duplicate
router.post('/:id/duplicate', async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req, res); if (!companyId) return;
    const source = await prisma.invoice.findFirst({
      where: { id: req.params.id, companyId }, include: { items: true },
    });
    if (!source) return res.status(404).json({ error: 'Facture non trouvée' });

    const newNumber = await generateNextNumber(companyId, source.type);
    const invoice   = await prisma.invoice.create({
      data: {
        invoiceNumber: newNumber, type: source.type, companyId,
        userId: source.userId, clientId: source.clientId, supplierId: source.supplierId,
        status: 'DRAFT', subtotal: source.subtotal, discount: source.discount,
        tax: source.tax, total: source.total, notes: source.notes,
        isRecurring: source.isRecurring, recurringInterval: source.recurringInterval,
        recurringEndDate: source.recurringEndDate,
        nextRecurringDate: source.isRecurring ? computeNextDate(new Date(), source.recurringInterval!) : null,
        items: {
          create: source.items.map(it => ({
            articleId: it.articleId, quantity: it.quantity,
            unitPrice: it.unitPrice, discount: it.discount,
            tax: it.tax, total: it.total,
          })),
        },
      },
      include: invoiceInclude,
    });
    res.status(201).json(invoice);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la duplication' });
  }
});

// POST /invoices/:id/generate-next
router.post('/:id/generate-next', async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req, res); if (!companyId) return;
    const source = await prisma.invoice.findFirst({
      where: { id: req.params.id, companyId, isRecurring: true }, include: { items: true },
    });
    if (!source) return res.status(404).json({ error: 'Facture récurrente non trouvée' });
    if (source.recurringEndDate && source.recurringEndDate < new Date())
      return res.status(400).json({ error: 'La récurrence de cette facture est terminée' });

    const newNumber = await generateNextNumber(companyId, source.type);
    const nextDate  = computeNextDate(new Date(), source.recurringInterval!);

    const [newInvoice] = await prisma.$transaction([
      prisma.invoice.create({
        data: {
          invoiceNumber: newNumber, type: source.type, companyId,
          userId: source.userId, clientId: source.clientId, supplierId: source.supplierId,
          status: 'PENDING', subtotal: source.subtotal, discount: source.discount,
          tax: source.tax, total: source.total, notes: source.notes,
          parentInvoiceId: source.id, isRecurring: false,
          items: {
            create: source.items.map(it => ({
              articleId: it.articleId, quantity: it.quantity,
              unitPrice: it.unitPrice, discount: it.discount,
              tax: it.tax, total: it.total,
            })),
          },
        },
      }),
      prisma.invoice.update({ where: { id: req.params.id }, data: { nextRecurringDate: nextDate } }),
    ]);

    res.status(201).json({ invoice: newInvoice, nextRecurringDate: nextDate });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la génération de l'occurrence" });
  }
});

// POST /invoices/:id/send
router.post('/:id/send', async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req, res); if (!companyId) return;
    const existing  = await prisma.invoice.findFirst({ where: { id: req.params.id, companyId } });
    if (!existing) return res.status(404).json({ error: 'Facture non trouvée' });
    if (existing.status !== 'DRAFT')
      return res.status(400).json({ error: 'Seul un brouillon peut être envoyé' });

    const invoice = await prisma.invoice.update({
      where: { id: req.params.id }, data: { status: 'SENT' }, include: invoiceInclude,
    });
    // TODO: envoi email
    res.json({ message: 'Facture marquée comme envoyée', invoice });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de l'envoi" });
  }
});

// DELETE /invoices/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const companyId = getCompanyId(req, res); if (!companyId) return;
    const existing  = await prisma.invoice.findFirst({ where: { id: req.params.id, companyId } });
    if (!existing) return res.status(404).json({ error: 'Facture non trouvée' });
    if (!['DRAFT','CANCELLED'].includes(existing.status))
      return res.status(403).json({ error: 'Seules les factures en brouillon ou annulées peuvent être supprimées' });

    await prisma.invoice.delete({ where: { id: req.params.id } });
    res.json({ message: 'Facture supprimée avec succès' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

export default router;
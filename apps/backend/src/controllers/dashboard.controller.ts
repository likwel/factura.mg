import { Router, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

const MONTHS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

function getCompanyId(req: AuthRequest, res: Response): string | null {
  const id = req.user?.companyId;
  if (!id) { res.status(400).json({ message: 'Company ID manquant' }); return null; }
  return id;
}

// ── GET /dashboard/stats ─────────────────────────────────────
router.get('/stats', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = getCompanyId(req, res);
    if (!companyId) return;

    const now          = new Date();
    const startOfYear  = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday   = new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);

    const [
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      totalClients,
      annualRevenueAgg,
      todayRevenueAgg,
      benefitAnnual,
      benefitMonth,
      benefitToday,
      lowStockArticles,
      last3MonthsRaw,
    ] = await Promise.all([

      prisma.invoice.count({
        where: { companyId, type: 'INVOICE' as any },
      }),

      prisma.invoice.count({
        where: { companyId, type: 'INVOICE' as any, status: { in: ['COMPLETED','PAID'] as any } },
      }),

      prisma.invoice.count({
        where: { companyId, type: 'INVOICE' as any, status: { in: ['PENDING','SENT','PARTIAL','VALIDATED','OVERDUE'] as any } },
      }),

      prisma.client.count({ where: { companyId } }),

      // C.A annuel encaissé
      prisma.invoice.aggregate({
        where: { companyId, type: 'INVOICE' as any, status: { in: ['COMPLETED','PAID'] as any }, createdAt: { gte: startOfYear } },
        _sum: { total: true },
      }),

      // C.A du jour encaissé
      prisma.invoice.aggregate({
        where: { companyId, type: 'INVOICE' as any, status: { in: ['COMPLETED','PAID'] as any }, createdAt: { gte: startOfToday, lt: endOfToday } },
        _sum: { total: true },
      }),

      // Bénéfice annuel
      prisma.$queryRaw<[{ profit: number }]>`
        SELECT COALESCE(SUM((ii."unitPrice" - a."purchasePrice") * ii.quantity), 0) AS profit
        FROM "InvoiceItem" ii
        JOIN "Invoice" i ON i.id = ii."invoiceId"
        JOIN "Article" a ON a.id = ii."articleId"
        WHERE i."companyId" = ${companyId}
          AND i."type"      = 'INVOICE'::"DocumentType"
          AND i."status"    IN ('COMPLETED','PAID')
          AND i."createdAt" >= ${startOfYear}
      `,

      // Bénéfice du mois
      prisma.$queryRaw<[{ profit: number }]>`
        SELECT COALESCE(SUM((ii."unitPrice" - a."purchasePrice") * ii.quantity), 0) AS profit
        FROM "InvoiceItem" ii
        JOIN "Invoice" i ON i.id = ii."invoiceId"
        JOIN "Article" a ON a.id = ii."articleId"
        WHERE i."companyId" = ${companyId}
          AND i."type"      = 'INVOICE'::"DocumentType"
          AND i."status"    IN ('COMPLETED','PAID')
          AND i."createdAt" >= ${startOfMonth}
      `,

      // Bénéfice du jour
      prisma.$queryRaw<[{ profit: number }]>`
        SELECT COALESCE(SUM((ii."unitPrice" - a."purchasePrice") * ii.quantity), 0) AS profit
        FROM "InvoiceItem" ii
        JOIN "Invoice" i ON i.id = ii."invoiceId"
        JOIN "Article" a ON a.id = ii."articleId"
        WHERE i."companyId" = ${companyId}
          AND i."type"      = 'INVOICE'::"DocumentType"
          AND i."status"    IN ('COMPLETED','PAID')
          AND i."createdAt" >= ${startOfToday}
          AND i."createdAt" <  ${endOfToday}
      `,

      // Stock faible
      prisma.$queryRaw<{ id: string; name: string; code: string; currentStock: number }[]>`
        SELECT id, name, code, "currentStock"
        FROM "Article"
        WHERE "companyId"    = ${companyId}
          AND "isActive"     = true
          AND "currentStock" <= "stockMin"
        LIMIT 10
      `,

      // 3 derniers mois — toutes factures (encaissé + en cours)
      prisma.$queryRaw<{ month: number; year: number; paid: number; pending: number }[]>`
        SELECT
          EXTRACT(MONTH FROM "createdAt")::int AS month,
          EXTRACT(YEAR  FROM "createdAt")::int AS year,
          COALESCE(SUM(CASE WHEN "status" IN ('COMPLETED','PAID')
            THEN total ELSE 0 END), 0) AS paid,
          COALESCE(SUM(CASE WHEN "status" NOT IN ('COMPLETED','PAID','CANCELLED','EXPIRED')
            THEN total ELSE 0 END), 0) AS pending
        FROM "Invoice"
        WHERE "companyId" = ${companyId}
          AND "type"      = 'INVOICE'::"DocumentType"
          AND "createdAt" >= ${new Date(now.getFullYear(), now.getMonth() - 2, 1)}
        GROUP BY year, month
        ORDER BY year ASC, month ASC
      `,
    ]);

    // Construire les 3 mois avec labels même si aucune facture
    const last3Months = Array.from({ length: 3 }, (_, i) => {
      const d     = new Date(now.getFullYear(), now.getMonth() - (2 - i), 1);
      const m     = d.getMonth() + 1;
      const y     = d.getFullYear();
      const found = last3MonthsRaw.find(r => Number(r.month) === m && Number(r.year) === y);
      return {
        label:   MONTHS[d.getMonth()],
        year:    y,
        paid:    Number(found?.paid    ?? 0),
        pending: Number(found?.pending ?? 0),
      };
    });

    res.json({
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      totalClients,
      totalRevenue:  Number(annualRevenueAgg._sum?.total ?? 0),
      todayRevenue:  Number(todayRevenueAgg._sum?.total  ?? 0),
      totalBenefit:  Number(benefitAnnual[0]?.profit     ?? 0),
      benefitMonth:  Number(benefitMonth[0]?.profit      ?? 0),
      benefitToday:  Number(benefitToday[0]?.profit      ?? 0),
      lowStockArticles,
      last3Months,
    });

  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Erreur lors du chargement des statistiques' });
  }
});

// ── GET /dashboard/revenue-chart?period=monthly|daily|yearly&year= ───────
router.get('/revenue-chart', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const companyId = getCompanyId(req, res);
    if (!companyId) return;

    const period = (req.query.period as string) ?? 'monthly';
    const year   = parseInt(req.query.year as string) || new Date().getFullYear();

    let chart: { name: string; paid: number; pending: number }[] = [];

    if (period === 'monthly') {
      const start = new Date(year, 0, 1);
      const end   = new Date(year + 1, 0, 1);
      const rows  = await prisma.$queryRaw<{ month: number; paid: number; pending: number }[]>`
        SELECT
          EXTRACT(MONTH FROM "createdAt")::int AS month,
          COALESCE(SUM(CASE WHEN "status" IN ('COMPLETED','PAID')
            THEN total ELSE 0 END), 0) AS paid,
          COALESCE(SUM(CASE WHEN "status" NOT IN ('COMPLETED','PAID','CANCELLED','EXPIRED')
            THEN total ELSE 0 END), 0) AS pending
        FROM "Invoice"
        WHERE "companyId" = ${companyId}
          AND "type"      = 'INVOICE'::"DocumentType"
          AND "createdAt" >= ${start}
          AND "createdAt" <  ${end}
        GROUP BY month ORDER BY month ASC
      `;
      chart = MONTHS.map((name, i) => {
        const f = rows.find(r => Number(r.month) === i + 1);
        return { name, paid: Number(f?.paid ?? 0), pending: Number(f?.pending ?? 0) };
      });

    } else if (period === 'daily') {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const rows  = await prisma.$queryRaw<{ day: string; paid: number; pending: number }[]>`
        SELECT
          TO_CHAR("createdAt", 'DD/MM') AS day,
          COALESCE(SUM(CASE WHEN "status" IN ('COMPLETED','PAID')
            THEN total ELSE 0 END), 0) AS paid,
          COALESCE(SUM(CASE WHEN "status" NOT IN ('COMPLETED','PAID','CANCELLED','EXPIRED')
            THEN total ELSE 0 END), 0) AS pending
        FROM "Invoice"
        WHERE "companyId" = ${companyId}
          AND "type"      = 'INVOICE'::"DocumentType"
          AND "createdAt" >= ${since}
        GROUP BY day ORDER BY MIN("createdAt") ASC
      `;
      chart = rows.map(r => ({ name: r.day, paid: Number(r.paid), pending: Number(r.pending) }));

    } else if (period === 'yearly') {
      const since = new Date(new Date().getFullYear() - 4, 0, 1);
      const rows  = await prisma.$queryRaw<{ year: number; paid: number; pending: number }[]>`
        SELECT
          EXTRACT(YEAR FROM "createdAt")::int AS year,
          COALESCE(SUM(CASE WHEN "status" IN ('COMPLETED','PAID')
            THEN total ELSE 0 END), 0) AS paid,
          COALESCE(SUM(CASE WHEN "status" NOT IN ('COMPLETED','PAID','CANCELLED','EXPIRED')
            THEN total ELSE 0 END), 0) AS pending
        FROM "Invoice"
        WHERE "companyId" = ${companyId}
          AND "type"      = 'INVOICE'::"DocumentType"
          AND "createdAt" >= ${since}
        GROUP BY year ORDER BY year ASC
      `;
      chart = rows.map(r => ({
        name:    String(r.year),
        paid:    Number(r.paid),
        pending: Number(r.pending),
      }));
    }

    res.json(chart);

  } catch (err) {
    console.error('Revenue chart error:', err);
    res.status(500).json({ error: 'Erreur graphique' });
  }
});

export default router;
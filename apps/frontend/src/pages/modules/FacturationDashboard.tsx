import { useEffect, useState, useCallback } from 'react';
import { FileText, DollarSign, TrendingUp, PiggyBank, AlertTriangle, Calendar } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import api from '../../services/api';

// ==================== TYPES ====================

type Period = 'daily' | 'monthly' | 'yearly';

interface ChartPoint { name: string; paid: number; pending: number }
interface Month3     { label: string; year: number; paid: number; pending: number }
interface LowStock   { id: string; name: string; code: string; currentStock: number }

interface DashboardStats {
  totalInvoices:    number;
  paidInvoices:     number;
  pendingInvoices:  number;
  totalClients:     number;
  totalRevenue:     number;
  todayRevenue:     number;
  totalBenefit:     number;
  benefitMonth:     number;
  benefitToday:     number;
  lowStockArticles: LowStock[];
  last3Months:      Month3[];
}

// ==================== HELPERS ====================

const formatAr = (v: number) =>
  `${v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Ar`;

const fmtShort = (v: number) => {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}k`;
  return String(v);
};

// ==================== COLORS ====================

type ColorKey = 'purple' | 'blue' | 'green' | 'orange';

const COLOR_MAP: Record<ColorKey, { bg: string; border: string; text: string; iconBg: string; iconColor: string }> = {
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-[var(--main-color)]', iconBg: 'bg-purple-100', iconColor: 'text-[var(--main-color)]' },
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-[var(--main-color)]', iconBg: 'bg-blue-100',   iconColor: 'text-[var(--main-color)]' },
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-[var(--main-color)]', iconBg: 'bg-green-100',  iconColor: 'text-[var(--main-color)]' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-[var(--main-color)]', iconBg: 'bg-orange-100', iconColor: 'text-[var(--main-color)]' },
};

// ==================== STAT CARD ====================

interface StatBadge    { label: string; value: string | number; dot?: string }
interface StatCardProps { title: string; value?: string | number; badges?: StatBadge[]; icon: React.ElementType; color?: ColorKey }

function StatCard({ title, value, badges, icon: Icon, color = 'purple' }: StatCardProps) {
  const t = COLOR_MAP[color];
  return (
    <div className={`${t.bg} ${t.border} border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium uppercase tracking-wide opacity-70">{title}</p>
        <div className={`${t.iconBg} ${t.iconColor} p-3 rounded-xl shrink-0`}><Icon className="w-6 h-6" /></div>
      </div>
      {value !== undefined && <p className={`text-2xl font-bold ${t.text}`}>{value}</p>}
      {badges && badges.length > 0 && (
        <div className="flex items-end gap-4 flex-wrap">
          {badges.map((b, i) => (
            <div key={i} className="flex flex-col">
              <span className={`text-2xl font-bold ${t.text} leading-none`}>{b.value}</span>
              <span className="flex items-center gap-1 mt-1">
                {b.dot && <span className={`w-1.5 h-1.5 rounded-full ${b.dot} shrink-0`} />}
                <span className="text-xs text-gray-500 font-medium">{b.label}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== TOOLTIP ====================

function RevenueTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ fontWeight: 700, marginBottom: 8, color: '#374151' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ color: '#6b7280' }}>{p.name} :</span>
          <span style={{ fontWeight: 600, color: p.color }}>{formatAr(Number(p.value))}</span>
        </div>
      ))}
    </div>
  );
}

// ==================== PERIOD CONFIG ====================

const PERIOD_CFG: Record<Period, { label: string; desc: (year: number) => string }> = {
  daily:   { label: 'Journalier', desc: ()     => '30 derniers jours'       },
  monthly: { label: 'Mensuel',    desc: (y)    => `Mois de l'année ${y}`    },
  yearly:  { label: 'Annuel',     desc: ()     => '5 dernières années'      },
};

// ==================== DASHBOARD ====================

export default function FacturationDashboard() {
  const currentYear = new Date().getFullYear();

  const [stats,        setStats]        = useState<DashboardStats | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [chartYear,    setChartYear]    = useState(currentYear);
  const [period,       setPeriod]       = useState<Period>('monthly');
  const [chartLoading, setChartLoading] = useState(false);
  const [chartData,    setChartData]    = useState<ChartPoint[]>([]);

  const availableYears = Array.from({ length: 4 }, (_, i) => currentYear - i);

  // ── Charge la courbe séparément
  const loadChart = useCallback(async (p: Period, y: number) => {
    setChartLoading(true);
    try {
      const res = await api.get(`/dashboard/revenue-chart?period=${p}&year=${y}`);
      setChartData(res.data ?? []);
    } catch (err) {
      console.error('Chart error:', err);
    } finally {
      setChartLoading(false);
    }
  }, []);

  // ── Charge les stats + courbe initiale en parallèle
  useEffect(() => {
    const init = async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get(`/dashboard/revenue-chart?period=monthly&year=${currentYear}`),
        ]);
        setStats(statsRes.data);
        setChartData(chartRes.data ?? []);
      } catch (err) {
        console.error('Dashboard init error:', err);
        setStats({
          totalInvoices: 0, paidInvoices: 0, pendingInvoices: 0,
          totalClients: 0, totalRevenue: 0, todayRevenue: 0,
          totalBenefit: 0, benefitMonth: 0, benefitToday: 0,
          lowStockArticles: [], last3Months: [],
        });
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Recharge la courbe quand period / année change
  useEffect(() => {
    if (loading) return;
    loadChart(period, chartYear);
  }, [period, chartYear, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--main-color)' }} />
      </div>
    );
  }

  const months3      = stats?.last3Months ?? [];
  const maxMonth     = Math.max(...months3.map(m => m.paid + m.pending), 1);
  const benefitCards = [
    { label: "Aujourd'hui", value: stats?.benefitToday ?? 0, cls: 'bg-blue-50   border-blue-200   text-blue-700'   },
    { label: 'Ce mois',     value: stats?.benefitMonth ?? 0, cls: 'bg-green-50  border-green-200  text-green-700'  },
    { label: 'Cette année', value: stats?.totalBenefit ?? 0, cls: 'bg-purple-50 border-purple-200 text-purple-700' },
  ];

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble de votre activité</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow-md addBtn" style={{ background: 'var(--main-color)' }}>
          <FileText className="w-5 h-5" /> Générer un rapport
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="TOTAL FACTURES"
          badges={[
            { value: stats?.totalInvoices   ?? 0, label: 'total',    dot: 'bg-purple-400' },
            { value: stats?.paidInvoices    ?? 0, label: 'payées',   dot: 'bg-green-500'  },
            { value: stats?.pendingInvoices ?? 0, label: 'en cours', dot: 'bg-amber-500'  },
          ]}
          icon={FileText} color="purple"
        />
        <StatCard title="C.A ANNUEL"      value={formatAr(stats?.totalRevenue ?? 0)} icon={DollarSign} color="purple" />
        <StatCard title="C.A DU JOUR"     value={formatAr(stats?.todayRevenue ?? 0)} icon={TrendingUp} color="purple" />
        <StatCard title="BÉNÉFICE ANNUEL" value={formatAr(stats?.totalBenefit ?? 0)} icon={PiggyBank}  color="purple" />
      </div>

      {/* Graphique + 3 derniers mois */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Courbe */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Chiffre d'affaires</h2>
              <p className="text-sm text-gray-400">{PERIOD_CFG[period].desc(chartYear)}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Toggle période */}
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                {(Object.keys(PERIOD_CFG) as Period[]).map(p => (
                  <button key={p} onClick={() => setPeriod(p)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap
                      ${period === p ? 'bg-white shadow' : 'text-gray-400 hover:text-gray-600'}`}
                    style={period === p ? { color: 'var(--main-color)' } : {}}>
                    {PERIOD_CFG[p].label}
                  </button>
                ))}
              </div>
              {/* Sélecteur année — mensuel seulement */}
              {period === 'monthly' && (
                <select value={chartYear} onChange={e => setChartYear(Number(e.target.value))}
                  className="text-sm border rounded-lg px-3 py-1.5 bg-white focus:outline-none"
                  style={{ borderColor: 'var(--main-color)', color: 'var(--main-color)' }}>
                  {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              )}
            </div>
          </div>

          {/* Légende */}
          <div className="flex items-center gap-5 mb-3">
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="var(--main-color)" strokeWidth="2.5" /></svg>
              Encaissé
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="var(--main-color)" strokeWidth="2.5" strokeDasharray="5 3" strokeOpacity="0.4" /></svg>
              En cours
            </span>
          </div>

          {chartLoading ? (
            <div className="flex items-center justify-center" style={{ height: 270 }}>
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--main-color)' }} />
            </div>
          ) : chartData.length === 0 ? (
            <div className="flex items-center justify-center text-gray-400 text-sm" style={{ height: 270 }}>
              Aucune donnée pour cette période
            </div>
          ) : (
            <div style={{ width: '100%', height: 270 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '11px' }} />
                  <YAxis stroke="#9ca3af" style={{ fontSize: '11px' }} width={55} tickFormatter={fmtShort} />
                  <Tooltip content={<RevenueTooltip />} />
                  <Line type="monotone" dataKey="paid"    name="Encaissé" stroke="var(--main-color)" strokeWidth={2.5} dot={{ fill: 'var(--main-color)', r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="pending" name="En cours" stroke="var(--main-color)" strokeWidth={2.5} strokeDasharray="5 4" strokeOpacity={0.4} dot={{ fill: 'var(--main-color)', r: 3, fillOpacity: 0.4 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 3 derniers mois */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Calendar className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-800">3 derniers mois</h2>
          </div>

          <div className="space-y-5">
            {months3.map((m, i) => {
              const isLast   = i === months3.length - 1;
              const total    = m.paid + m.pending;
              const paidPct  = total > 0 ? Math.round((m.paid    / maxMonth) * 100) : 0;
              const pendPct  = total > 0 ? Math.round((m.pending / maxMonth) * 100) : 0;
              return (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-semibold ${isLast ? 'text-purple-700' : 'text-gray-700'}`}>
                      {m.label} {m.year}
                    </span>
                    <span className="text-xs text-gray-400">{formatAr(total)}</span>
                  </div>
                  {/* Barre encaissé */}
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs text-gray-400 w-16 shrink-0">Encaissé</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${paidPct}%` }} />
                    </div>
                    <span className="text-xs font-medium text-emerald-600 w-20 text-right shrink-0">{formatAr(m.paid)}</span>
                  </div>
                  {/* Barre en cours */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-gray-400 w-16 shrink-0">En cours</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pendPct}%` }} />
                    </div>
                    <span className="text-xs font-medium w-20 text-right shrink-0" style={{ color: 'var(--main-color)', opacity: 0.6 }}>{formatAr(m.pending)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Évolution */}
          {months3.length >= 2 && (() => {
            const prev = months3[months3.length - 2];
            const curr = months3[months3.length - 1];
            const prevTotal = prev.paid + prev.pending;
            const currTotal = curr.paid + curr.pending;
            if (prevTotal === 0) return null;
            const diff = ((currTotal - prevTotal) / prevTotal * 100).toFixed(1);
            const up   = currTotal >= prevTotal;
            return (
              <div className={`mt-5 flex items-center justify-between p-3 rounded-lg ${up ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                <span className="text-xs text-gray-500">vs mois précédent</span>
                <span className={`text-sm font-bold ${up ? 'text-green-600' : 'text-red-500'}`}>
                  {up ? '▲' : '▼'} {Math.abs(Number(diff))}%
                </span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Détail bénéfice */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Détail du bénéfice</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {benefitCards.map((b, i) => (
            <div key={i} className="border rounded-2xl p-5 flex items-center justify-between"
              style={{ background: 'color-mix(in srgb, var(--main-color) 8%, white)', borderColor: 'color-mix(in srgb, var(--main-color) 25%, white)', color: 'var(--main-color)' }}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide opacity-60 mb-1 text-black">{b.label}</p>
                <p className="text-xl font-bold">{formatAr(b.value)}</p>
              </div>
              <PiggyBank className="w-8 h-8 opacity-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Alertes stock */}
      {(stats?.lowStockArticles?.length ?? 0) > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-800">Alertes stock faible</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats!.lowStockArticles.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{a.name}</p>
                  <p className="text-sm text-gray-600">Code : {a.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Stock</p>
                  <p className="font-bold text-orange-600">{a.currentStock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
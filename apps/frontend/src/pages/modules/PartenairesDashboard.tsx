import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users, UserPlus, TrendingUp, TrendingDown, DollarSign,
  AlertCircle, Calendar, MapPin, Mail, Phone,
  ArrowUpRight, ArrowDownRight, Activity, Building2,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

// ==================== TYPES ====================

interface Stats {
  total:        number;
  active:       number;
  inactive:     number;
  newThisMonth: number;
  totalCredit:  number;
  totalDebt:    number;
  growthRate:   number;
}

interface TopPartner {
  id:           string;
  name:         string;
  code:         string;
  totalAmount:  number;
  invoiceCount: number;
  lastActivity: string;
}

// ==================== HELPERS ====================

const formatAr = (n: number) =>
  new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + ' Ar';

const fmtDate = (s: string) =>
  s ? new Date(s).toLocaleDateString('fr-FR') : '—';

const initials = (name: string) =>
  name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

// ==================== STAT CARD ====================

function StatCard({ title, value, icon: Icon, trend, trendValue, sub }: {
  title: string; value: string | number; icon: React.ElementType;
  trend?: 'up' | 'down'; trendValue?: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 leading-none">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              {trend === 'up'
                ? <ArrowUpRight className="w-3.5 h-3.5 text-green-500" />
                : <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />}
              <span className={`text-xs font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
                {trendValue}
              </span>
              <span className="text-xs text-gray-400">ce mois</span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl shrink-0 ml-3"
          style={{ background: 'color-mix(in srgb, var(--main-color) 12%, white)' }}>
          <Icon className="w-6 h-6" style={{ color: 'var(--main-color)' }} />
        </div>
      </div>
    </div>
  );
}

// ==================== COMPONENT ====================

export default function PartenairesDashboard() {
  const navigate     = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const type         = searchParams.get('type') || 'client';
  const { user }     = useAuth();

  console.log(user)
  const companyId    = user?.defaultCompanyId;
  const isClient     = type === 'client';

  const [stats,          setStats]          = useState<Stats>({ total: 0, active: 0, inactive: 0, newThisMonth: 0, totalCredit: 0, totalDebt: 0, growthRate: 0 });
  const [topPartners,    setTopPartners]    = useState<TopPartner[]>([]);
  const [recentPartners, setRecentPartners] = useState<any[]>([]);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => { loadDashboardData(); }, [type]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, topRes, recentRes] = await Promise.all([
        api.get(`/partners/${type}s/stats`,  { params: { companyId } }),
        api.get(`/partners/${type}s/top`,    { params: { limit: 5, companyId } }),
        api.get(`/partners/${type}s`,        { params: { limit: 5, sortBy: 'createdAt', order: 'desc', companyId } }),
      ]);
      setStats(statsRes.data.data ?? statsRes.data);
      setTopPartners(Array.isArray(topRes.data.data)    ? topRes.data.data    : Array.isArray(topRes.data)    ? topRes.data    : []);
      setRecentPartners(Array.isArray(recentRes.data.data) ? recentRes.data.data : Array.isArray(recentRes.data) ? recentRes.data : []);
    } catch (err) {
      console.error('Dashboard error:', err);
      toast.error('Erreur de chargement');
      setTopPartners([]); setRecentPartners([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--main-color)' }} />
    </div>
  );

  const activePct   = stats.total > 0 ? Math.round((stats.active   / stats.total) * 100) : 0;
  const inactivePct = stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">

      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isClient ? 'Dashboard Clients' : 'Dashboard Fournisseurs'}
          </h1>
          <p className="text-gray-500 mt-0.5 text-sm">
            Vue d'ensemble de vos {type}s et leurs activités
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle client / fournisseur */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            {['client', 'fournisseur'].map(t => (
              <button key={t} onClick={() => setSearchParams({ type: t })}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize"
                style={type === t
                  ? { background: 'var(--main-color)', color: 'white' }
                  : { color: '#6b7280' }}>
                {t === 'client' ? 'Clients' : 'Fournisseurs'}
              </button>
            ))}
          </div>

          {/* <button
            onClick={() => navigate(`/app/partenaires/${type}s/new`)}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-xl text-sm font-medium shadow-sm transition-all"
            style={{ background: 'var(--main-color)' }}>
            <UserPlus className="w-4 h-4" />
            Nouveau {type}
          </button> */}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={`Total ${type}s`}
          value={stats.total}
          icon={Users}
          trend={stats.growthRate >= 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(stats.growthRate)}%`}
        />
        <StatCard title={`${isClient ? 'Clients' : 'Fournisseurs'} actifs`} value={stats.active}       icon={Activity}  sub={`${activePct}% du total`} />
        <StatCard title="Nouveaux ce mois"                                   value={stats.newThisMonth} icon={UserPlus}  />
        <StatCard
          title={isClient ? 'Créances totales' : 'Dettes totales'}
          value={formatAr(stats.totalDebt)}
          icon={DollarSign}
          sub={stats.totalDebt > 0 ? 'En cours de recouvrement' : 'Aucune dette'}
        />
      </div>

      {/* Répartition + Top partenaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Répartition */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Répartition par statut</h2>

          <div className="space-y-5">
            {/* Actifs */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                  <span className="text-sm font-medium text-gray-600">Actifs</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{stats.active} — {activePct}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-700"
                  style={{ width: `${activePct}%` }} />
              </div>
            </div>

            {/* Inactifs */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" />
                  <span className="text-sm font-medium text-gray-600">Inactifs</span>
                </div>
                <span className="text-sm font-bold text-gray-800">{stats.inactive} — {inactivePct}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gray-300 rounded-full transition-all duration-700"
                  style={{ width: `${inactivePct}%` }} />
              </div>
            </div>
          </div>

          {/* Résumé chiffré */}
          <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-3 gap-3 text-center">
            {[
              { label: 'Total', val: stats.total,        color: 'text-gray-900' },
              { label: 'Actifs', val: stats.active,      color: 'text-green-600' },
              { label: 'Inactifs', val: stats.inactive,  color: 'text-gray-400' },
            ].map((s, i) => (
              <div key={i}>
                <p className={`text-2xl font-bold ${s.color}`}>{s.val}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top partenaires */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-gray-800">Top {type}s</h2>
            <button onClick={() => navigate(`/app/partenaires/${type}s`)}
              className="text-xs font-medium hover:underline"
              style={{ color: 'var(--main-color)' }}>
              Voir tout →
            </button>
          </div>

          <div className="space-y-2">
            {topPartners.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">Aucune donnée disponible</p>
            ) : topPartners.map((p, i) => (
              <div key={p.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group"
                onClick={() => navigate(`/app/partenaires/${type}s/${p.id}`)}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: `color-mix(in srgb, var(--main-color) ${90 - i * 15}%, #818cf8)` }}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 group-hover:text-[var(--main-color)] transition-colors">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.code} · {p.invoiceCount} factures</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{formatAr(p.totalAmount)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tableau partenaires récents */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">{isClient ? 'Clients' : 'Fournisseurs'} récents</h2>
          <span className="text-xs text-gray-400">5 derniers ajoutés</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Nom / Code', 'Contact', 'Adresse', 'Statut', 'Créé le'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentPartners.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">Aucun {type} récent</td></tr>
              ) : recentPartners.map(p => (
                <tr key={p.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/app/partenaires/${type}s/${p.id}`)}>

                  {/* Nom */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{ background: 'var(--main-color)' }}>
                        {initials(p.name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.code}</p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-5 py-3.5">
                    <div className="space-y-1">
                      {p.email && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Mail className="w-3.5 h-3.5 text-gray-300 shrink-0" />{p.email}
                        </div>
                      )}
                      {p.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Phone className="w-3.5 h-3.5 text-gray-300 shrink-0" />{p.phone}
                        </div>
                      )}
                      {!p.email && !p.phone && <span className="text-xs text-gray-300">—</span>}
                    </div>
                  </td>

                  {/* Adresse */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      {p.address || <span className="text-gray-300">Non renseigné</span>}
                    </div>
                  </td>

                  {/* Statut */}
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border
                      ${p.isActive
                        ? 'bg-green-50 text-green-700 border-green-100'
                        : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {p.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>

                  {/* Date */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Calendar className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      {fmtDate(p.createdAt)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerte créances */}
      {stats.totalDebt > 0 && (
        <div className="rounded-2xl p-4 border flex items-start gap-3"
          style={{ background: 'color-mix(in srgb, var(--main-color) 6%, white)', borderColor: 'color-mix(in srgb, var(--main-color) 25%, white)' }}>
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: 'var(--main-color)' }} />
          <div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--main-color)' }}>
              {isClient ? 'Créances en cours' : 'Dettes en cours'}
            </h3>
            <p className="text-sm text-gray-600 mt-0.5">
              Vous avez <strong>{formatAr(stats.totalDebt)}</strong> de {isClient ? 'créances' : 'dettes'} en cours.
              Pensez à relancer vos {type}s.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
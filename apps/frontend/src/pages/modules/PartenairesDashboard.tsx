// apps/frontend/src/pages/modules/partenaires/PartenairesDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users,
  UserPlus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Calendar,
  MapPin,
  Mail,
  Phone,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext'; // Contexte d'authentification

interface Stats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  totalCredit: number;
  totalDebt: number;
  growthRate: number;
}

interface TopPartner {
  id: string;
  name: string;
  code: string;
  totalAmount: number;
  invoiceCount: number;
  lastActivity: string;
}

export default function PartenairesDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type') || 'client';
  const { user } = useAuth(); // Récupérer l'utilisateur connecté
  const companyId = user?.companyId; // ID de l'entreprise de l'utilisateur

  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    inactive: 0,
    newThisMonth: 0,
    totalCredit: 0,
    totalDebt: 0,
    growthRate: 0,
  });

  const [topPartners, setTopPartners] = useState<TopPartner[]>([]);
  const [recentPartners, setRecentPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [type]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques
      const statsResponse = await api.get(`/partners/${type}s/stats`, {
        params: { companyId }
      });
      setStats(statsResponse.data.data || statsResponse.data);

      // Charger les top partenaires
      const topResponse = await api.get(`/partners/${type}s/top`, {
        params: { limit: 5, companyId }
      });
      setTopPartners(Array.isArray(topResponse.data.data) ? topResponse.data.data : 
                     Array.isArray(topResponse.data) ? topResponse.data : []);

      // Charger les partenaires récents
      const recentResponse = await api.get(`/partners/${type}s`, {
        params: { 
          limit: 5, 
          sortBy: 'createdAt', 
          order: 'desc',
          companyId 
        }
      });
      setRecentPartners(recentResponse.data.data || recentResponse.data || []);

    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      toast.error('Erreur de chargement des données');
      // Réinitialiser avec des valeurs par défaut en cas d'erreur
      setTopPartners([]);
      setRecentPartners([]);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    trendValue, 
    color = 'blue' 
  }: any) => {
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                {trend === 'up' ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-sm font-medium ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trendValue}
                </span>
                <span className="text-sm text-gray-500">ce mois</span>
              </div>
            )}
          </div>
          <div className={`${colorClasses[color as keyof typeof colorClasses]} bg-opacity-10 p-3 rounded-lg`}>
            <Icon className={`w-6 h-6 ${colorClasses[color as keyof typeof colorClasses].replace('bg-', 'text-')}`} />
          </div>
        </div>
      </div>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MGA',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Dashboard {type === 'client' ? 'Clients' : 'Fournisseurs'}
          </h1>
          <p className="text-gray-600 mt-1">
            Vue d'ensemble de vos {type}s et leurs activités
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSearchParams({ type: 'client' })}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              type === 'client'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Clients
          </button>
          <button
            onClick={() => setSearchParams({ type: 'fournisseur' })}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              type === 'fournisseur'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Fournisseurs
          </button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={`Total ${type}s`}
          value={stats.total}
          icon={Users}
          trend={stats.growthRate > 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(stats.growthRate)}%`}
          color="blue"
        />
        
        <StatCard
          title={`${type}s actifs`}
          value={stats.active}
          icon={Activity}
          color="green"
        />
        
        <StatCard
          title="Nouveaux ce mois"
          value={stats.newThisMonth}
          icon={UserPlus}
          color="purple"
        />
        
        <StatCard
          title={type === 'client' ? 'Créances totales' : 'Dettes totales'}
          value={formatCurrency(stats.totalDebt)}
          icon={DollarSign}
          color={stats.totalDebt > 0 ? 'orange' : 'green'}
        />
      </div>

      {/* Graphiques et détails */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition Active/Inactive */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Répartition par statut
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Actifs</span>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.active} ({stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${stats.total > 0 ? (stats.active / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Inactifs</span>
                <span className="text-sm font-semibold text-gray-900">
                  {stats.inactive} ({stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gray-400 h-2 rounded-full"
                  style={{ width: `${stats.total > 0 ? (stats.inactive / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Total</span>
              <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
            </div>
          </div>
        </div>

        {/* Top Partenaires */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Top {type}s
            </h2>
            <button
              onClick={() => navigate(`/partenaires/clients?type=${type}`)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Voir tout →
            </button>
          </div>

          <div className="space-y-3">
            {topPartners.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Aucune donnée disponible
              </p>
            ) : (
              topPartners.map((partner, index) => (
                <div
                  key={partner.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  onClick={() => navigate(`/${type}s/${partner.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        #{index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{partner.name}</p>
                      <p className="text-xs text-gray-500">{partner.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(partner.totalAmount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {partner.invoiceCount} factures
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Partenaires récents */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              {type}s récents
            </h2>
            <button
              onClick={() => navigate(`/partenaires/clients?type=${type}`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Nouveau {type}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Adresse
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Date création
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentPartners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Aucun {type} récent
                  </td>
                </tr>
              ) : (
                recentPartners.map((partner) => (
                  <tr
                    key={partner.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/${type}s/${partner.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {partner?.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{partner?.name}</p>
                          <p className="text-xs text-gray-500">{partner?.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {partner?.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400" />
                            {partner.email}
                          </div>
                        )}
                        {partner?.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400" />
                            {partner.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        {partner?.address || 'Non renseigné'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          partner?.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {partner?.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(partner?.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alertes */}
      {stats.totalDebt > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-orange-900">
                Attention aux créances
              </h3>
              <p className="text-sm text-orange-800 mt-1">
                Vous avez {formatCurrency(stats.totalDebt)} de créances en cours.
                Pensez à relancer vos {type}s.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
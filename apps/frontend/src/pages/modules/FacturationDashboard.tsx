// apps/frontend/src/pages/modules/facturation/FacturationDashboard.tsx
import { useEffect, useState } from 'react';
import { Package, DollarSign, TrendingUp, PiggyBank, FileText, AlertTriangle } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../services/api';

// Composant StatCard
function StatCard({ title, value, icon: Icon, color = 'purple' }: any) {
  const gradients: any = {
    purple: 'from-purple-500 to-purple-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className={`bg-gradient-to-br ${gradients[color]} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-white/80 text-sm font-medium uppercase tracking-wide mb-2">
            {title}
          </p>
          <p className="text-3xl font-bold">
            {value}
          </p>
        </div>
        
        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
}

export default function FacturationDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
      // Utiliser des données mock en cas d'erreur
      setStats({
        totalArticles: 33,
        totalClients: 45,
        totalInvoices: 156,
        totalRevenue: 30000,
        lowStockArticles: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Données pour le graphique de chiffre d'affaires
  const revenueData = [
    { name: 'Jan', value: 180 },
    { name: 'Fév', value: 240 },
    { name: 'Mar', value: 200 },
    { name: 'Avr', value: 210 },
    { name: 'Mai', value: 195 },
    { name: 'Jun', value: 220 },
    { name: 'Jul', value: 210 },
  ];

  // Données pour le graphique en camembert
  const pieData = [
    { name: 'Catégorie A', value: 400, color: '#a855f7' },
    { name: 'Catégorie B', value: 300, color: '#60a5fa' },
    { name: 'Catégorie C', value: 200, color: '#34d399' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">Vue d'ensemble de votre activité</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md">
          <FileText className="w-5 h-5" />
          Générer un rapport
        </button>
      </div>

      {/* Cards statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="TOTAL ARTICLES"
          value={stats?.totalArticles?.toFixed(2) || '33,00'}
          icon={Package}
          color="purple"
        />
        <StatCard
          title="C.A ANNUEL"
          value={`${(stats?.totalRevenue || 30000).toLocaleString()} Ar`}
          icon={DollarSign}
          color="purple"
        />
        <StatCard
          title="C.A DU JOUR"
          value="0,00 Ar"
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="BÉNÉFICE"
          value="430 000,00 Ar"
          icon={PiggyBank}
          color="purple"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique de chiffre d'affaires */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Évaluation de Chiffre d'affaires
              </h2>
              <p className="text-sm text-gray-500">Rapport journalier</p>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
            </button>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
              />
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#a855f7" 
                strokeWidth={3}
                fill="url(#colorValue)"
                dot={{ fill: '#a855f7', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Graphique en camembert */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Répartition</h2>
            <button className="px-3 py-1 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors">
              Config
            </button>
          </div>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-800">
                  {((item.value / pieData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alertes stock faible */}
      {stats?.lowStockArticles && stats.lowStockArticles.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-800">Alertes Stock Faible</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.lowStockArticles.map((article: any) => (
              <div key={article.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{article.name}</p>
                  <p className="text-sm text-gray-600">Code: {article.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Stock</p>
                  <p className="font-bold text-orange-600">{article.currentStock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
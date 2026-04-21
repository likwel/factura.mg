import { useEffect, useState } from 'react';
import { Package, Users, FileText, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    api.get('/dashboard/stats').then(res => setStats(res.data));
  }, []);

  const cards = [
    { title: 'Articles', value: stats?.totalArticles || 0, icon: Package, color: 'bg-blue-500' },
    { title: 'Clients', value: stats?.totalClients || 0, icon: Users, color: 'bg-green-500' },
    { title: 'Factures', value: stats?.totalInvoices || 0, icon: FileText, color: 'bg-purple-500' },
    { title: 'Revenu', value: `${(stats?.totalRevenue || 0).toLocaleString()} Ar`, icon: DollarSign, color: 'bg-yellow-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
        <p className="text-gray-600">Vue d'ensemble de votre activité</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="text-gray-600 text-sm mb-1">{card.title}</h3>
            <p className="text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {stats?.lowStockArticles?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold">Alertes Stock Faible</h2>
          </div>
          <div className="space-y-2">
            {stats.lowStockArticles.map((article: any) => (
              <div key={article.id} className="flex justify-between p-3 bg-orange-50 rounded-lg">
                <span className="font-medium">{article.name}</span>
                <span className="text-orange-600 font-bold">{article.currentStock}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

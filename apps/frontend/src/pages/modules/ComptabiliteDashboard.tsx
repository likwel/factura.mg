// apps/frontend/src/pages/modules/comptabilite/VentesPage.tsx
import { useState, useEffect } from 'react';
import { Search, RefreshCw, Plus, ChevronDown, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';

export default function ComptabiliteDashboard() {
  const [activeTab, setActiveTab] = useState('Ventes');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await api.get('/invoices');
      setTransactions(response.data);
    } catch (error) {
      console.error('Erreur de chargement');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      'Validé': 'bg-green-100 text-green-700',
      'En cours': 'bg-yellow-100 text-yellow-700',
      'Brouillon': 'bg-gray-100 text-gray-700',
      'Annulé': 'bg-red-100 text-red-700',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[status] || statusConfig['En cours']}`}>
        {status}
      </span>
    );
  };

  const tabs = ['Ventes', 'Achats', 'Caisse', 'Banque'];

  return (
    <div className="space-y-6">
      {/* Onglets de navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                activeTab === tab
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-md">
            <Plus className="w-4 h-4" />
            Créer vente
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un document"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Calendar className="w-4 h-4" />
            <span>Choisir une plage de dates</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <span>Filtrer par st...</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <span>Actions</span>
          </button>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 px-6 py-4">
                <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                RÉFÉRENCE
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                PARTENAIRE
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                STATUT
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                TOTAL
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                CRÉÉ LE
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                MODIFIÉ LE
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {[
              { ref: 'FAC0005', client: 'MGBI', status: 'En cours', total: '1 070 000,00', date: '20/01/2026' },
              { ref: 'FAC0002', client: 'MGBI', status: 'En cours', total: '780 000,00', date: '23/10/2025' },
            ].map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                </td>
                <td className="px-6 py-4">
                  <a href="#" className="text-teal-600 hover:text-teal-800 font-medium">
                    {item.ref}
                  </a>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      M
                    </div>
                    <span className="text-gray-900">{item.client}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{item.total} Ar</td>
                <td className="px-6 py-4 text-gray-600">{item.date}</td>
                <td className="px-6 py-4 text-gray-600">{item.date}</td>
                <td className="px-6 py-4 text-right">
                  <button className="inline-flex items-center gap-2 px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-lg">
                    <span className="text-sm">Actions</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm">
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg">←</button>
            <button className="px-3 py-1 bg-green-500 text-white rounded-lg">1</button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">→</button>
          </div>
        </div>
      </div>
    </div>
  );
}
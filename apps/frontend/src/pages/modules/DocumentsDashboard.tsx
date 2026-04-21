// apps/frontend/src/pages/modules/documents/FacturesClientsPage.tsx
import { useState, useEffect } from 'react';
import { Search, RefreshCw, Plus, ChevronDown, Calendar, Filter } from 'lucide-react';
import api from '../../services/api';

export default function DocumentsDashboard() {
  const [factures, setFactures] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadFactures();
  }, []);

  const loadFactures = async () => {
    try {
      const response = await api.get('/invoices');
      setFactures(response.data);
    } catch (error) {
      console.error('Erreur');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      'Validé': 'bg-green-100 text-green-700 border border-green-200',
      'En cours': 'bg-yellow-100 text-yellow-700 border border-yellow-200',
      'Brouillon': 'bg-gray-100 text-gray-700 border border-gray-200',
    };

    return (
      <span className={`px-3 py-1 rounded-md text-xs font-medium ${statusConfig[status] || statusConfig['En cours']}`}>
        {status}
      </span>
    );
  };

  const mockFactures = [
    { 
      ref: 'FAC0005', 
      client: 'MGBI', 
      status: 'Validé', 
      total: '1 070 000,00',
      created: '20/01/2026',
      modified: '20/01/2026'
    },
    { 
      ref: 'FAC0004', 
      client: 'MGBI', 
      status: 'En cours', 
      total: '260 000,00',
      created: '23/10/2025',
      modified: '23/10/2025'
    },
    { 
      ref: 'FAC0003', 
      client: 'MGBI', 
      status: 'En cours', 
      total: '520 000,00',
      created: '23/10/2025',
      modified: '23/10/2025'
    },
    { 
      ref: 'FAC0002', 
      client: 'MGBI', 
      status: 'Validé', 
      total: '780 000,00',
      created: '23/10/2025',
      modified: '23/10/2025'
    },
    { 
      ref: 'FAC0001', 
      client: 'MGBI', 
      status: 'En cours', 
      total: '1 040 000,00',
      created: '23/10/2025',
      modified: '23/10/2025'
    },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Facture client</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">
            <Plus className="w-4 h-4" />
            Créer facture
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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Choisir une plage de dates</span>
            <span className="text-gray-400">×</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filtrer par st...</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
            <span className="text-sm">Actions</span>
          </button>
        </div>
      </div>

      {/* Tableau des factures */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 px-6 py-4">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
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
            {mockFactures.map((facture, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </td>
                <td className="px-6 py-4">
                  <a href="#" className={`font-medium ${
                    facture.status === 'Validé' ? 'text-green-600 hover:text-green-800' : 'text-blue-600 hover:text-blue-800'
                  }`}>
                    {facture.ref}
                  </a>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      M
                    </div>
                    <span className="text-gray-900 font-medium">{facture.client}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(facture.status)}
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900">{facture.total} Ar</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-600">{facture.created}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-gray-600">{facture.modified}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="inline-flex items-center gap-2 px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
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
            <select className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500">
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
            <span className="text-sm text-gray-600">par page</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 text-gray-600">
              ←
            </button>
            <button className="px-3 py-1 bg-green-500 text-white rounded-lg font-medium">
              1
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
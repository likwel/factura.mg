// apps/frontend/src/pages/modules/inventaire/StockPage.tsx
import { useState, useEffect } from 'react';
import { Search, Upload, Plus, ChevronDown, Star } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function InventaireDashboard() {
  const [articles, setArticles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const response = await api.get('/articles');
      setArticles(response.data);
    } catch (error) {
      toast.error('Erreur de chargement');
    }
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Stocks actuels</h1>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Upload className="w-5 h-5" />
            Importer
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-md">
            <Plus className="w-5 h-5" />
            Nouvel article
          </button>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher des articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500">
              <option>Tous</option>
              <option>En stock</option>
              <option>Stock faible</option>
              <option>Rupture</option>
            </select>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <span>Actions</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des articles */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 px-6 py-4">
                <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                ARTICLE
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                STOCK EN COMMANDE
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                QUANTITÉ EN STOCK
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                RATING
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {articles.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  Aucun article en stock
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-orange-600 font-semibold text-sm">
                          {article.code ? article.code.substring(0, 2).toUpperCase() : 'AR'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          [{article.code || 'WWWM'}] - {article.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {article.description || 'Ordi portable be mitsy'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-600">0 Pcs</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${
                      article.currentStock === 0 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {article.currentStock || 0} Pcs
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {renderRating(3)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="inline-flex items-center gap-2 px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <span className="text-sm">Actions</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
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
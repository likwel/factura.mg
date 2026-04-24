// pages/ArticleForm.tsx
import React, { useState, useEffect } from 'react';
import { Package, FolderTree, Loader2, Save, X, Trash2, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface CategoryOption {
  value: string;
  label: string;
}

interface ArticleFormData {
  code: string;
  name: string;
  description: string;
  purchasePrice: string;
  sellingPrice: string;
  stockMin: string;
  stockMax: string;
  currentStock: string;
  unit: string;
  barcode: string;
  categoryId: string;
  supplierId: string;
  image: string;
}

interface ArticleFormProps {
  articleId?: string; // Si fourni, mode édition
  onSuccess?: () => void;
  onCancel?: () => void;
  categories?: CategoryOption[];
}

const ArticleForm: React.FC<ArticleFormProps> = ({ 
  articleId, 
  onSuccess, 
  onCancel, 
  categories = [] 
}) => {
  // URL de base de l'API - CHANGEZ ICI selon votre configuration
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const [formData, setFormData] = useState<ArticleFormData>({
    code: '',
    name: '',
    description: '',
    purchasePrice: '',
    sellingPrice: '',
    stockMin: '0',
    stockMax: '',
    currentStock: '0',
    unit: 'Pièce',
    barcode: '',
    categoryId: '',
    supplierId: '',
    image: ''
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isEditMode = !!articleId;

  // Charger les données si mode édition
  useEffect(() => {
    if (articleId) {
      loadArticle();
    }
  }, [articleId]);

  const loadArticle = async () => {
    setLoadingData(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/articles/${articleId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.text(); // Utiliser text() au lieu de json()
        throw new Error(errorData || 'Erreur lors du chargement');
      }

      const data = await response.json();
      setFormData({
        code: data.code || '',
        name: data.name || '',
        description: data.description || '',
        purchasePrice: data.purchasePrice?.toString() || '',
        sellingPrice: data.sellingPrice?.toString() || '',
        stockMin: data.stockMin?.toString() || '0',
        stockMax: data.stockMax?.toString() || '',
        currentStock: data.currentStock?.toString() || '0',
        unit: data.unit || 'Pièce',
        barcode: data.barcode || '',
        categoryId: data.categoryId || '',
        supplierId: data.supplierId || '',
        image: data.image || ''
      });
    } catch (error: any) {
      setErrorMessage(error.message || 'Erreur lors du chargement de l\'article');
      console.error('Erreur de chargement:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.code.trim()) newErrors.code = 'Le code est requis';
    if (!formData.name.trim()) newErrors.name = 'Le nom est requis';
    if (!formData.purchasePrice) newErrors.purchasePrice = 'Le prix d\'achat est requis';
    if (!formData.sellingPrice) newErrors.sellingPrice = 'Le prix de vente est requis';
    
    const purchasePrice = parseFloat(formData.purchasePrice);
    const sellingPrice = parseFloat(formData.sellingPrice);
    
    if (sellingPrice < purchasePrice) {
      newErrors.sellingPrice = 'Le prix de vente doit être supérieur au prix d\'achat';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      setErrorMessage('Veuillez corriger les erreurs du formulaire');
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const url = isEditMode 
        ? `${API_BASE_URL}/api/articles/${articleId}` 
        : `${API_BASE_URL}/api/articles`;
      
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          code: formData.code,
          name: formData.name,
          description: formData.description,
          purchasePrice: parseFloat(formData.purchasePrice),
          sellingPrice: parseFloat(formData.sellingPrice),
          stockMin: parseInt(formData.stockMin) || 0,
          stockMax: formData.stockMax ? parseInt(formData.stockMax) : null,
          currentStock: parseInt(formData.currentStock) || 0,
          unit: formData.unit,
          barcode: formData.barcode || null,
          categoryId: formData.categoryId || null,
          supplierId: formData.supplierId || null,
          image: formData.image || null
        })
      });

      // Vérifier le statut avant de parser le JSON
      if (!response.ok) {
        let errorMessage = 'Erreur lors de l\'enregistrement';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Si le JSON parsing échoue, utiliser le message par défaut
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      toast.success(
        isEditMode 
          ? 'Article modifié avec succès !' 
          : 'Article créé avec succès !'
      );
      setSuccessMessage(
        isEditMode 
          ? 'Article modifié avec succès !' 
          : 'Article créé avec succès !'
      );

      setTimeout(() => {
        onSuccess?.();
      }, 1500);

    } catch (error: any) {
      console.error('Erreur de soumission:', error);
      setErrorMessage(error.message || 'Une erreur est survenue');
      toast.error(error.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!articleId) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return;
    }

    setLoading(true);
    setErrorMessage('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/articles/${articleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la suppression';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setSuccessMessage(data.message || 'Article supprimé avec succès !');
      
      setTimeout(() => {
        onSuccess?.();
      }, 1500);

    } catch (error: any) {
      console.error('Erreur de suppression:', error);
      setErrorMessage(error.message || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const calculateMargin = () => {
    const purchase = parseFloat(formData.purchasePrice) || 0;
    const selling = parseFloat(formData.sellingPrice) || 0;
    const margin = selling - purchase;
    const marginPercent = purchase > 0 ? ((margin / purchase) * 100).toFixed(2) : 0;
    return { margin, marginPercent };
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Chargement...</span>
      </div>
    );
  }

  const { margin, marginPercent } = calculateMargin();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditMode ? 'Modifier l\'Article' : 'Créer un Article'}
            </h2>
            <p className="text-sm text-gray-600">
              {isEditMode 
                ? 'Modifiez les informations de l\'article' 
                : 'Ajoutez un nouveau produit à votre inventaire'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800 font-medium">{errorMessage}</span>
        </div>
      )}

      <div className="p-6">
        {/* Informations de base */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-blue-600 rounded"></div>
            Informations de base
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code Article <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.code ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="ART001"
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'article <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Nom du produit"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Description détaillée de l'article..."
              />
            </div>
          </div>
        </div>

        {/* Prix et marges */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-green-600 rounded"></div>
            Prix et Marges
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix d'achat (Ar) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.purchasePrice ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.purchasePrice && (
                <p className="mt-1 text-sm text-red-600">{errors.purchasePrice}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix de vente (Ar) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.sellingPrice ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.sellingPrice && (
                <p className="mt-1 text-sm text-red-600">{errors.sellingPrice}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unité
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="Pièce">Pièce</option>
                <option value="Kg">Kg</option>
                <option value="L">L</option>
                <option value="m">m</option>
                <option value="m²">m²</option>
                <option value="m³">m³</option>
                <option value="Carton">Carton</option>
                <option value="Lot">Lot</option>
              </select>
            </div>

            {/* Affichage de la marge */}
            {formData.purchasePrice && formData.sellingPrice && (
              <div className="md:col-span-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Marge unitaire</p>
                    <p className="text-2xl font-bold text-green-700">{margin.toFixed(2)} Ar</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Taux de marge</p>
                    <p className="text-2xl font-bold text-green-700">{marginPercent}%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stock */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-orange-600 rounded"></div>
            Gestion du Stock
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Minimum
              </label>
              <input
                type="number"
                value={formData.stockMin}
                onChange={(e) => setFormData({ ...formData, stockMin: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Maximum
              </label>
              <input
                type="number"
                value={formData.stockMax}
                onChange={(e) => setFormData({ ...formData, stockMax: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Optionnel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock Actuel
              </label>
              <input
                type="number"
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Informations complémentaires */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-purple-600 rounded"></div>
            Informations complémentaires
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code-barres
              </label>
              <input
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="EAN13, QR Code..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FolderTree className="w-4 h-4 inline mr-1" />
                Catégorie
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="">Aucune catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <ImageIcon className="w-4 h-4 inline mr-1" />
                URL de l'image
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div>
            {isEditMode && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium flex items-center gap-2 border border-red-200"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium flex items-center gap-2 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditMode ? 'Enregistrer' : 'Créer Article'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleForm;
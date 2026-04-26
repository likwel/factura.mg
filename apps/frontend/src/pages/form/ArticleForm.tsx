// apps/frontend/src/components/forms/ArticleForm.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  Package, FolderTree, Loader2, Save, X, Trash2, AlertCircle, 
  CheckCircle2, Image as ImageIcon, Copy, Edit, MoreVertical, ArrowLeft,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

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

type FormMode = 'create' | 'edit' | 'view' | 'duplicate';

const ArticleForm: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ Déterminer le mode à partir de l'URL
  const determineMode = (): FormMode => {
    if (!id) return 'create';
    if (location.pathname.endsWith('/edit')) return 'edit';
    if (location.pathname.endsWith('/duplicate')) return 'duplicate';
    return 'view';
  };

  const [mode, setMode] = useState<FormMode>(determineMode());
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  
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

  const isReadOnly = mode === 'view';

  // ✅ Mettre à jour le mode quand l'URL change
  useEffect(() => {
    const newMode = determineMode();
    console.log('🔄 Mode mis à jour:', newMode, '(URL:', location.pathname, ')');
    setMode(newMode);
  }, [id, location.pathname]);

  // ✅ Charger les catégories au montage
  useEffect(() => {
    loadCategories();
  }, []);

  // ✅ Charger l'article si ID présent et pas en mode create
  useEffect(() => {
    if (id && mode !== 'create') {
      loadArticle();
    }
  }, [id]);

  // ✅ Recharger en mode duplicate
  useEffect(() => {
    if (mode === 'duplicate' && id) {
      loadArticle();
    }
  }, [mode]);

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      const categoryOptions = response.data.data.map((cat: any) => ({
        value: cat.id,
        label: cat.name
      }));
      setCategories(categoryOptions);
      console.log('✅ Catégories chargées:', categoryOptions.length);
    } catch (error) {
      console.error('❌ Erreur chargement catégories:', error);
      setCategories([]);
    }
  };

  const loadArticle = async () => {
    if (!id) return;
    
    setLoadingData(true);
    setErrorMessage('');
    
    try {
      console.log('🔄 Chargement article:', id);
      const response = await api.get(`/articles/${id}`);
      const data = response.data;
      
      console.log('✅ Article chargé:', data.name);
      
      const isDuplicate = mode === 'duplicate';
      
      setFormData({
        code: isDuplicate ? `${data.code}_COPY` : (data.code || ''),
        name: isDuplicate ? `${data.name} (Copie)` : (data.name || ''),
        description: data.description || '',
        purchasePrice: data.purchasePrice?.toString() || '',
        sellingPrice: data.sellingPrice?.toString() || '',
        stockMin: data.stockMin?.toString() || '0',
        stockMax: data.stockMax?.toString() || '',
        currentStock: isDuplicate ? '0' : (data.currentStock?.toString() || '0'),
        unit: data.unit || 'Pièce',
        barcode: isDuplicate ? '' : (data.barcode || ''),
        categoryId: data.categoryId || '',
        supplierId: data.supplierId || '',
        image: data.image || ''
      });
      
    } catch (error: any) {
      console.error('❌ Erreur chargement:', error);
      const errorMsg = error.response?.data?.message || 'Erreur lors du chargement';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoadingData(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.code.trim()) {
      newErrors.code = 'Le code est requis';
    } else if (formData.code.trim().length < 2) {
      newErrors.code = 'Le code doit contenir au moins 2 caractères';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Le nom doit contenir au moins 3 caractères';
    }
    
    if (!formData.purchasePrice) {
      newErrors.purchasePrice = 'Le prix d\'achat est requis';
    }
    
    if (!formData.sellingPrice) {
      newErrors.sellingPrice = 'Le prix de vente est requis';
    }
    
    const purchasePrice = parseFloat(formData.purchasePrice);
    const sellingPrice = parseFloat(formData.sellingPrice);
    
    if (isNaN(purchasePrice) || purchasePrice < 0) {
      newErrors.purchasePrice = 'Prix d\'achat invalide';
    }
    
    if (isNaN(sellingPrice) || sellingPrice < 0) {
      newErrors.sellingPrice = 'Prix de vente invalide';
    }
    
    if (!isNaN(purchasePrice) && !isNaN(sellingPrice) && sellingPrice < purchasePrice) {
      newErrors.sellingPrice = 'Le prix de vente doit être supérieur au prix d\'achat';
    }
    
    // Validation du stock
    const stockMin = parseInt(formData.stockMin);
    const stockMax = formData.stockMax ? parseInt(formData.stockMax) : null;
    
    if (!isNaN(stockMin) && stockMax !== null && !isNaN(stockMax) && stockMax < stockMin) {
      newErrors.stockMax = 'Le stock max doit être supérieur au stock min';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (isReadOnly) return;
    
    if (!validate()) {
      setErrorMessage('Veuillez corriger les erreurs du formulaire');
      toast.error('Veuillez corriger les erreurs');
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const url = (mode === 'edit' && id) ? `/articles/${id}` : `/articles`;
      const method = (mode === 'edit' && id) ? 'put' : 'post';

      // ✅ Construction du payload - TOUS les champs sont envoyés
      const payload: any = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        purchasePrice: parseFloat(formData.purchasePrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        stockMin: parseInt(formData.stockMin) || 0,
        unit: formData.unit
      };

      // ⚠️ currentStock : seulement en création ou duplication (pas en édition)
      if (mode === 'create' || mode === 'duplicate') {
        payload.currentStock = parseInt(formData.currentStock) || 0;
      }

      // Champs optionnels : envoyer la valeur ou null (pas undefined)
      payload.description = formData.description.trim() || null;
      payload.stockMax = formData.stockMax ? parseInt(formData.stockMax) : null;
      payload.barcode = formData.barcode.trim() || null;
      payload.categoryId = formData.categoryId || null;
      payload.supplierId = formData.supplierId || null;
      payload.image = formData.image.trim() || null;

      console.log('📤 Envoi:', { method, url, payload });

      await api[method](url, payload);

      const successMsg = mode === 'edit' 
        ? 'Article modifié avec succès !' 
        : mode === 'duplicate'
        ? 'Article dupliqué avec succès !'
        : 'Article créé avec succès !';
      
      toast.success(successMsg);
      setSuccessMessage(successMsg);

      setTimeout(() => {
        navigate('/app/facturation/articles');
      }, 1500);

    } catch (error: any) {
      console.error('❌ Erreur:', error);
      const errorMsg = error.response?.data?.message || 'Une erreur est survenue';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm(`Voulez-vous vraiment supprimer cet article ?`)) return;

    setLoading(true);
    
    try {
      const response = await api.delete(`/articles/${id}`);
      toast.success(response.data.message || 'Article supprimé');
      
      setTimeout(() => {
        navigate('/app/facturation/articles');
      }, 1000);

    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Erreur lors de la suppression';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode: FormMode) => {
    console.log('🔄 Changement mode:', mode, '→', newMode);
    setShowActionMenu(false);
    
    if (newMode === 'edit' && id) {
      navigate(`/app/facturation/articles/${id}/edit`);
    } else if (newMode === 'view' && id) {
      navigate(`/app/facturation/articles/${id}`);
    } else if (newMode === 'duplicate' && id) {
      navigate(`/app/facturation/articles/${id}/duplicate`);
    }
  };

  const handleCancel = () => {
    navigate('/app/facturation/articles');
  };

  const calculateMargin = () => {
    const purchase = parseFloat(formData.purchasePrice) || 0;
    const selling = parseFloat(formData.sellingPrice) || 0;
    const margin = selling - purchase;
    const marginPercent = purchase > 0 ? ((margin / purchase) * 100).toFixed(2) : '0';
    return { margin, marginPercent };
  };

  if (loadingData) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Chargement...</span>
        </div>
      </div>
    );
  }

  const { margin, marginPercent } = calculateMargin();

  return (
    <div className="space-y-6">
      {/* Formulaire */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header du formulaire */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-white/70 rounded-lg transition-colors"
                title="Retour à la liste"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {mode === 'create' && 'Créer un Article'}
                  {mode === 'edit' && 'Modifier l\'Article'}
                  {mode === 'view' && 'Détails de l\'Article'}
                  {mode === 'duplicate' && 'Dupliquer l\'Article'}
                </h2>
                <p className="text-sm text-gray-600">
                  {mode === 'create' && 'Ajoutez un nouveau produit au catalogue'}
                  {mode === 'edit' && 'Modifiez les informations du produit'}
                  {mode === 'view' && `Code: ${formData.code} • ${formData.name}`}
                  {mode === 'duplicate' && 'Créez une copie de cet article'}
                </p>
              </div>
            </div>

            {/* Menu actions (mode VIEW uniquement) */}
            {mode === 'view' && (
              <div className="relative">
                <button
                  onClick={() => setShowActionMenu(!showActionMenu)}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                  title="Actions"
                >
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>

                {showActionMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowActionMenu(false)} />
                    
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                      <button
                        onClick={() => switchMode('edit')}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-3 transition-colors"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                        Modifier
                      </button>
                      
                      <button
                        onClick={() => switchMode('duplicate')}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-purple-50 flex items-center gap-3 transition-colors"
                      >
                        <Copy className="w-4 h-4 text-purple-600" />
                        Dupliquer
                      </button>
                      
                      <div className="border-t border-gray-200 my-1"></div>
                      
                      <button
                        onClick={handleDelete}
                        disabled={loading}
                        className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-3 transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-in fade-in duration-300">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-green-800 font-medium">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 animate-in fade-in duration-300">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-800 font-medium">{errorMessage}</span>
          </div>
        )}

        <div className="p-6">
          {/* Image */}
          {formData.image && (
            <div className="mb-6 flex justify-center">
              <div className="relative group">
                <img 
                  src={formData.image} 
                  alt={formData.name || 'Image de l\'article'}
                  className="max-w-md max-h-64 object-contain rounded-lg border shadow-md"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          )}

          {/* Champs du formulaire */}
          <div className="space-y-6">
            {/* Informations de base */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-600 rounded"></div>
                Informations de base
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code article <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    disabled={isReadOnly}
                    placeholder="Ex: ART001"
                    className={`w-full px-4 py-2 border rounded-lg transition-all ${
                      isReadOnly ? 'bg-gray-50 cursor-default' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    } ${errors.code ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errors.code && <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.code}
                  </p>}
                  {!errors.code && !isReadOnly && (
                    <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Identifiant unique (min. 2 caractères)
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du produit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={isReadOnly}
                    placeholder="Ex: Clavier mécanique RGB"
                    className={`w-full px-4 py-2 border rounded-lg transition-all ${
                      isReadOnly ? 'bg-gray-50 cursor-default' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    } ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>}
                  {!errors.name && !isReadOnly && (
                    <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Nom commercial du produit (min. 3 caractères)
                    </p>
                  )}
                </div>

                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={isReadOnly}
                    placeholder="Décrivez les caractéristiques principales du produit..."
                    rows={3}
                    className={`w-full px-4 py-2 border rounded-lg resize-none transition-all ${
                      isReadOnly ? 'bg-gray-50 cursor-default' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    } border-gray-300`}
                  />
                  {!isReadOnly && (
                    <p className="mt-1 text-xs text-gray-500">
                      Informations complémentaires sur le produit
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Prix */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
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
                    min="0"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    disabled={isReadOnly}
                    placeholder="10000"
                    className={`w-full px-4 py-2 border rounded-lg transition-all ${
                      isReadOnly ? 'bg-gray-50 cursor-default' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    } ${errors.purchasePrice ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errors.purchasePrice && <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.purchasePrice}
                  </p>}
                  {!errors.purchasePrice && !isReadOnly && (
                    <p className="mt-1 text-xs text-gray-500">
                      Coût d'acquisition HT
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix de vente (Ar) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    disabled={isReadOnly}
                    placeholder="15000"
                    className={`w-full px-4 py-2 border rounded-lg transition-all ${
                      isReadOnly ? 'bg-gray-50 cursor-default' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    } ${errors.sellingPrice ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errors.sellingPrice && <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.sellingPrice}
                  </p>}
                  {!errors.sellingPrice && !isReadOnly && (
                    <p className="mt-1 text-xs text-gray-500">
                      Prix public TTC
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unité de mesure</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    disabled={isReadOnly}
                    className={`w-full px-4 py-2 border rounded-lg transition-all ${
                      isReadOnly ? 'bg-gray-50 cursor-default' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    } border-gray-300`}
                  >
                    <option value="Pièce">Pièce</option>
                    <option value="Kg">Kilogramme (Kg)</option>
                    <option value="L">Litre (L)</option>
                    <option value="m">Mètre (m)</option>
                    <option value="m²">Mètre carré (m²)</option>
                    <option value="Carton">Carton</option>
                    <option value="Lot">Lot</option>
                    <option value="Paquet">Paquet</option>
                  </select>
                  {!isReadOnly && (
                    <p className="mt-1 text-xs text-gray-500">
                      Unité de vente du produit
                    </p>
                  )}
                </div>

                {formData.purchasePrice && formData.sellingPrice && (
                  <div className="md:col-span-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Marge brute</p>
                        <p className="text-2xl font-bold text-green-700">{margin.toFixed(2)} Ar</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Taux de marge</p>
                        <p className="text-2xl font-bold text-green-700">{marginPercent}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Coefficient</p>
                        <p className="text-2xl font-bold text-green-700">
                          {(parseFloat(formData.sellingPrice) / parseFloat(formData.purchasePrice) || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stock */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-orange-600 rounded"></div>
                Gestion du stock
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock minimum</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockMin}
                    onChange={(e) => setFormData({ ...formData, stockMin: e.target.value })}
                    disabled={isReadOnly}
                    placeholder="5"
                    className={`w-full px-4 py-2 border rounded-lg transition-all ${
                      isReadOnly ? 'bg-gray-50 cursor-default' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    } border-gray-300`}
                  />
                  {!isReadOnly && (
                    <p className="mt-1 text-xs text-gray-500">
                      Seuil d'alerte de réapprovisionnement
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock maximum</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockMax}
                    onChange={(e) => setFormData({ ...formData, stockMax: e.target.value })}
                    disabled={isReadOnly}
                    placeholder="100"
                    className={`w-full px-4 py-2 border rounded-lg transition-all ${
                      isReadOnly ? 'bg-gray-50 cursor-default' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    } ${errors.stockMax ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                  />
                  {errors.stockMax && <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.stockMax}
                  </p>}
                  {!errors.stockMax && !isReadOnly && (
                    <p className="mt-1 text-xs text-gray-500">
                      Capacité maximale de stockage
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock actuel
                    {mode === 'edit' && (
                      <span className="ml-2 text-xs text-orange-600 font-normal">
                        (Non modifiable en édition)
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                    disabled={isReadOnly || mode === 'edit'}
                    placeholder="50"
                    className={`w-full px-4 py-2 border rounded-lg transition-all ${
                      isReadOnly || mode === 'edit' ? 'bg-gray-50 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    } border-gray-300`}
                  />
                  {mode === 'edit' ? (
                    <p className="mt-1 text-xs text-orange-600 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Le stock se gère via les mouvements de stock
                    </p>
                  ) : !isReadOnly && (
                    <p className="mt-1 text-xs text-gray-500">
                      Quantité disponible en magasin
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Infos complémentaires */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-purple-600 rounded"></div>
                Informations complémentaires
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <FolderTree className="w-4 h-4" />
                    Catégorie
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    disabled={isReadOnly}
                    className={`w-full px-4 py-2 border rounded-lg transition-all ${
                      isReadOnly ? 'bg-gray-50 cursor-default' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    } border-gray-300`}
                  >
                    <option value="">Sélectionnez une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  {!isReadOnly && (
                    <p className="mt-1 text-xs text-gray-500">
                      Classification du produit
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code-barres / EAN</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    disabled={isReadOnly}
                    placeholder="Ex: 3245678901234"
                    className={`w-full px-4 py-2 border rounded-lg transition-all ${
                      isReadOnly ? 'bg-gray-50 cursor-default' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    } border-gray-300`}
                  />
                  {!isReadOnly && (
                    <p className="mt-1 text-xs text-gray-500">
                      Code EAN-13, UPC ou autre format
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <ImageIcon className="w-4 h-4" />
                    URL de l'image
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    disabled={isReadOnly}
                    placeholder="https://exemple.com/images/produit.jpg"
                    className={`w-full px-4 py-2 border rounded-lg transition-all ${
                      isReadOnly ? 'bg-gray-50 cursor-default' : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    } border-gray-300`}
                  />
                  {!isReadOnly && (
                    <p className="mt-1 text-xs text-gray-500">
                      Lien vers une image du produit (format JPG, PNG)
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              {isReadOnly ? 'Fermer' : 'Annuler'}
            </button>
            
            {!isReadOnly && (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {mode === 'edit' ? 'Enregistrer les modifications' : mode === 'duplicate' ? 'Créer la copie' : 'Créer l\'article'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleForm;
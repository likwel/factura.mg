// pages/PartnerForm.tsx
import React, { useState, useEffect } from 'react';
import { Users, User, Truck, Loader2, Save, X, Trash2, AlertCircle, CheckCircle2, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

enum PartnerType {
  CLIENT = 'client',
  SUPPLIER = 'supplier'
}

interface PartnerFormData {
  code: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  taxId: string;
  creditLimit: string;
  type: PartnerType;
}

interface PartnerFormProps {
  partnerId?: string; // Si fourni, mode édition
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PartnerForm: React.FC<PartnerFormProps> = ({ 
  partnerId, 
  onSuccess, 
  onCancel 
}) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const [partnerType, setPartnerType] = useState<PartnerType>(PartnerType.CLIENT);
  const [formData, setFormData] = useState<Omit<PartnerFormData, 'type'>>({
    code: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    creditLimit: ''
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isEditMode = !!partnerId;

  // Charger les données si mode édition
  useEffect(() => {
    if (partnerId) {
      loadPartner();
    }
  }, [partnerId]);

  const loadPartner = async () => {
    setLoadingData(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/partners/${partnerId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Erreur lors du chargement');
      }

      const data = await response.json();
      setFormData({
        code: data.code || '',
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        taxId: data.taxId || '',
        creditLimit: data.creditLimit?.toString() || ''
      });
      setPartnerType(data.type || PartnerType.CLIENT);
    } catch (error: any) {
      setErrorMessage(error.message || 'Erreur lors du chargement du partenaire');
      console.error('Erreur de chargement:', error);
      toast.error(error.message || 'Erreur lors du chargement du partenaire')
    } finally {
      setLoadingData(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Le code est requis';
    } else if (formData.code.length < 2) {
      newErrors.code = 'Le code doit contenir au moins 2 caractères';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (formData.phone && formData.phone.length < 8) {
      newErrors.phone = 'Numéro de téléphone invalide';
    }

    if (formData.creditLimit) {
      const limit = parseFloat(formData.creditLimit);
      if (isNaN(limit) || limit < 0) {
        newErrors.creditLimit = 'La limite de crédit doit être un nombre positif';
      }
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
        ? `${API_BASE_URL}/api/partners/${partnerId}` 
        : `${API_BASE_URL}/api/partners`;
      
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
          email: formData.email || null,
          phone: formData.phone || null,
          address: formData.address || null,
          taxId: formData.taxId || null,
          creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : null,
          type: partnerType
        })
      });

      if (!response.ok) {
        let errorMessage = 'Erreur lors de l\'enregistrement';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Erreur ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      setSuccessMessage(
        isEditMode 
          ? 'Partenaire modifié avec succès !' 
          : `${partnerType === PartnerType.CLIENT ? 'Client' : 'Fournisseur'} créé avec succès !`
      );

      toast.success(
        isEditMode 
          ? 'Partenaire modifié avec succès !' 
          : `${partnerType === PartnerType.CLIENT ? 'Client' : 'Fournisseur'} créé avec succès !`
      );

      setTimeout(() => {
        onSuccess?.();
      }, 1500);

    } catch (error: any) {
      console.error('Erreur de soumission:', error);
      setErrorMessage(error.message || 'Une erreur est survenue');
      toast.error(error.message || 'Une erreur est survenue')
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!partnerId) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce partenaire ?')) {
      return;
    }

    setLoading(true);
    setErrorMessage('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/partners/${partnerId}`, {
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
      setSuccessMessage(data.message || 'Partenaire supprimé avec succès !');
      
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

  if (loadingData) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEditMode ? 'Modifier le Partenaire' : 'Créer un Partenaire'}
            </h2>
            <p className="text-sm text-gray-600">
              {isEditMode 
                ? 'Modifiez les informations du partenaire' 
                : 'Ajoutez un nouveau client ou fournisseur'}
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
        {/* Type de partenaire */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-blue-600 rounded"></div>
            Type de partenaire
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setPartnerType(PartnerType.CLIENT)}
              disabled={loading}
              className={`p-4 rounded-xl border-2 transition-all ${
                partnerType === PartnerType.CLIENT
                  ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-md'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${
                  partnerType === PartnerType.CLIENT
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                    : 'bg-gray-100'
                }`}>
                  <User className={`w-6 h-6 ${
                    partnerType === PartnerType.CLIENT ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <span className={`text-lg font-semibold ${
                  partnerType === PartnerType.CLIENT ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  Client
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPartnerType(PartnerType.SUPPLIER)}
              disabled={loading}
              className={`p-4 rounded-xl border-2 transition-all ${
                partnerType === PartnerType.SUPPLIER
                  ? 'border-green-500 bg-gradient-to-r from-green-50 to-green-100 shadow-md'
                  : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${
                  partnerType === PartnerType.SUPPLIER
                    ? 'bg-gradient-to-br from-green-500 to-green-600'
                    : 'bg-gray-100'
                }`}>
                  <Truck className={`w-6 h-6 ${
                    partnerType === PartnerType.SUPPLIER ? 'text-white' : 'text-gray-600'
                  }`} />
                </div>
                <span className={`text-lg font-semibold ${
                  partnerType === PartnerType.SUPPLIER ? 'text-green-700' : 'text-gray-700'
                }`}>
                  Fournisseur
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Informations de base */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-purple-600 rounded"></div>
            Informations de base
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.code ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="P001"
                disabled={loading}
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Nom du partenaire"
                disabled={loading}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-green-600 rounded"></div>
            Contact
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="email@example.com"
                disabled={loading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                Téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="+261 XX XX XXX XX"
                disabled={loading}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Adresse
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Adresse complète"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* Informations fiscales */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-orange-600 rounded"></div>
            Informations fiscales et crédit
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                NIF/STAT
              </label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Numéro fiscal"
                disabled={loading}
              />
            </div>

            {partnerType === PartnerType.CLIENT && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <CreditCard className="w-4 h-4 inline mr-1" />
                  Limite de crédit (Ar)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.creditLimit ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  disabled={loading}
                />
                {errors.creditLimit && (
                  <p className="mt-1 text-sm text-red-600">{errors.creditLimit}</p>
                )}
              </div>
            )}
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
                  {isEditMode ? 'Enregistrer' : `Créer ${partnerType === PartnerType.CLIENT ? 'Client' : 'Fournisseur'}`}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerForm;
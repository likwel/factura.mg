// apps/frontend/src/components/modals/CreateOrganizationModal.tsx
import { useState } from 'react';
import { X, Building2, Upload, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface CreateOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateOrganizationModal({ 
  isOpen, 
  onClose,
  onSuccess 
}: CreateOrganizationModalProps) {
  const { user, subscription } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: null as File | null
  });
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  // Vérifier les limites selon le plan
  const getOrganizationLimit = () => {
    if (!subscription) return 1;
    const limits: Record<string, number> = {
      STARTER: 1,
      PROFESSIONAL: 5,
      ENTERPRISE: -1 // Illimité
    };
    return limits[subscription.plan] || 1;
  };

  const canCreateOrganization = () => {
    const limit = getOrganizationLimit();
    if (limit === -1) return true; // Illimité
    const currentCount = user?.companyMemberships.filter(m => 
      m.company.ownerId === user.id
    ).length || 0;
    return currentCount < limit;
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Le logo ne doit pas dépasser 2MB');
        return;
      }
      setFormData({ ...formData, logo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!canCreateOrganization()) {
      setError(`Vous avez atteint la limite de ${getOrganizationLimit()} organisation(s) pour votre plan ${subscription?.plan}`);
      return;
    }

    if (!formData.name.trim()) {
      setError('Le nom de l\'organisation est requis');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }
      if (formData.logo) {
        formDataToSend.append('logo', formData.logo);
      }

      const response = await api.post('/companies', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Recharger les données utilisateur
      const userResponse = await api.get('/auth/me');
      localStorage.setItem('user', JSON.stringify(userResponse.data));
      
      // Forcer le rechargement de la page pour mettre à jour le contexte
      window.location.reload();
      
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const limit = getOrganizationLimit();
  const currentCount = user?.companyMemberships.filter(m => 
    m.company.ownerId === user.id
  ).length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Créer une organisation
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {limit === -1 
                  ? 'Organisations illimitées' 
                  : `${currentCount}/${limit} organisation(s) utilisée(s)`
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Plan Limit Warning */}
          {!canCreateOrganization() && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900">
                  Limite atteinte
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  Votre plan {subscription?.plan} permet {limit} organisation(s) maximum. 
                  Passez au plan supérieur pour en créer davantage.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo de l'organisation
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <label className="flex-1 cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                  <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-sm text-gray-600">
                    Cliquer pour choisir
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG (max 2MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={handleLogoChange}
                  className="hidden"
                  disabled={!canCreateOrganization()}
                />
              </label>
            </div>
          </div>

          {/* Organization Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'organisation <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Mon Entreprise SARL"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={!canCreateOrganization()}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (optionnel)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez brièvement votre organisation..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              disabled={!canCreateOrganization()}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !canCreateOrganization()}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
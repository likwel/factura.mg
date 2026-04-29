// apps/frontend/src/pages/modules/parametre/ParametreDashboard.tsx
import { useState, useEffect } from 'react';
import { 
  User, Building2, Users, Shield, Bell, Palette, 
  CreditCard, Key, Smartphone, Mail, Lock,
  Save, Upload, Check, AlertCircle, Settings,
  Trash2, Plus, CheckCircle2, Crown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import toast from 'react-hot-toast';
import api from '../../services/api';
import NumberingConfigForm from '../form/NumberingConfigForm';

interface ParametreDashboardProps {
  id?: string;
}

export default function ParametreDashboard({ id = 'profil' }: ParametreDashboardProps) {
  const { user } = useAuth();

  return (
    <div className="mx-auto">
      {id === 'profil' && <ProfilSection user={user} />}
      {id === 'entreprise' && <EntrepriseSection />}
      {id === 'utilisateurs' && <UtilisateursSection />}
      {id === 'permissions' && <PermissionsSection />}
      {id === 'abonnement' && <AbonnementSection />}
      {id === 'notifications' && <NotificationsSection />}
      {id === 'theme' && <ThemeSection />}
      {id === 'securite' && <SecuriteSection />}
      {id === 'numerotation' && <NumberingConfigForm />}
    </div>
  );
}


// ============================================
// SECTION PROFIL (Corrigée et Fonctionnelle)
// ============================================
function ProfilSection({ user }: any) {
  const { setUser } = useAuth(); // Pour mettre à jour le contexte
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Mettre à jour le state quand user change
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  // Gérer la sélection de l'avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('L\'image ne doit pas dépasser 5MB');
        toast.error('L\'image ne doit pas dépasser 5MB');
        return;
      }

      // Vérifier le type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrorMessage('Seules les images (JPEG, PNG, GIF, WebP) sont autorisées');
        toast.error('Seules les images (JPEG, PNG, GIF, WebP) sont autorisées');
        return;
      }

      setAvatarFile(file);
      
      // Créer une preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Validation côté client
      if (!formData.firstName || formData.firstName.trim().length < 2) {
        throw new Error('Le prénom doit contenir au moins 2 caractères');
      }

      if (!formData.lastName || formData.lastName.trim().length < 2) {
        throw new Error('Le nom doit contenir au moins 2 caractères');
      }

      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error('Adresse email invalide');
      }

      // Créer un FormData pour envoyer les fichiers
      const formDataToSend = new FormData();
      formDataToSend.append('firstName', formData.firstName.trim());
      formDataToSend.append('lastName', formData.lastName.trim());
      formDataToSend.append('email', formData.email.trim());
      if (formData.phone) {
        formDataToSend.append('phone', formData.phone.trim());
      }
      
      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

      const response = await api.put('/users/me', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      setSuccessMessage('Profil mis à jour avec succès !');
      toast.success('Profil mis à jour avec succès !');
      
      // Réinitialiser l'avatar preview et file
      setAvatarFile(null);
      setAvatarPreview(null);
      
      // // Mettre à jour le contexte utilisateur
      // if (setUser) {
      //   setUser(response.data);
      // }

      // // Mettre à jour le localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...currentUser, ...response.data }));

      // Recharger la page après 1.5 secondes
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error: any) {
      const message = error.response?.data?.error || error.message || 'Erreur lors de la mise à jour du profil';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Informations personnelles</h2>
            <p className="text-sm text-gray-600">Mettez à jour votre profil et vos informations personnelles</p>
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
        {/* Avatar Section */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-blue-600 rounded"></div>
            Photo de profil
          </h3>
          
          <div className="flex items-center gap-6">
            <div className="relative group">
              {avatarPreview || user?.avatar ? (
                <img 
                  src={avatarPreview || `http://localhost:3000${user?.avatar}`}
                  alt="Avatar"
                  className="w-28 h-28 rounded-2xl object-cover shadow-xl"
                />
              ) : (
                <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
              )}
              <label 
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 shadow-lg transition-all hover:scale-110 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <input 
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </h3>
              <p className="text-gray-600 mt-1 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
              <div className="flex items-center gap-3 mt-4">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold">
                  <Shield className="w-4 h-4" />
                  {user?.role}
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-semibold">
                  <Check className="w-4 h-4" />
                  Actif
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-green-600 rounded"></div>
            Informations de base
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Entrez votre prénom"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Entrez votre nom"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse e-mail <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="email@exemple.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de téléphone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+261 34 00 000 00"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Dernière mise à jour : {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}
          </p>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SECTION ENTREPRISE (Corrigée)
// ============================================
function EntrepriseSection() {
  const { currentCompany } = useAuth();
  const {
    isOwner,
    canEditOrganization,
    canDeleteOrganization
  } = usePermissions();

  const [formData, setFormData] = useState({
    name: currentCompany?.name || '',
    email: currentCompany?.email || '',
    phone: currentCompany?.phone || '',
    address: currentCompany?.address || '',
    taxId: currentCompany?.taxId || '',
    logo: null as File | null
  });

  // ✅ Mettre à jour le state quand currentCompany change
  useEffect(() => {
    if (currentCompany) {
      // console.log('📊 Current Company Data:', currentCompany); // Debug
      setFormData({
        name: currentCompany.name || '',
        email: currentCompany.email || '',
        phone: currentCompany.phone || '',
        address: currentCompany.address || '',
        taxId: currentCompany.taxId || '',
        logo: null
      });
    }
  }, [currentCompany]);

  const [logoPreview, setLogoPreview] = useState<string>(currentCompany?.logo || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Le logo ne doit pas dépasser 2MB');
        toast.error('Le logo ne doit pas dépasser 2MB');
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
    setSuccess('');

    if (!canEditOrganization()) {
      setError('Vous n\'avez pas les permissions pour modifier cette organisation');
      toast.error('Permissions insuffisantes');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (formData.email) formDataToSend.append('email', formData.email);
      if (formData.phone) formDataToSend.append('phone', formData.phone);
      if (formData.address) formDataToSend.append('address', formData.address);
      if (formData.taxId) formDataToSend.append('taxId', formData.taxId);
      if (formData.logo) formDataToSend.append('logo', formData.logo);

      await api.put(`/companies/${currentCompany?.id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Recharger les données utilisateur
      const userResponse = await api.get('/auth/me');
      localStorage.setItem('user', JSON.stringify(userResponse.data));

      setSuccess('Organisation mise à jour avec succès !');
      toast.success('Organisation mise à jour avec succès !');
      setFormData({ ...formData, logo: null });
      
      // Recharger la page après 1.5 secondes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Une erreur est survenue';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrganization = async () => {
    if (!canDeleteOrganization()) {
      setError('Seul le propriétaire peut supprimer l\'organisation');
      toast.error('Permissions insuffisantes');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.delete(`/companies/${currentCompany?.id}`);
      toast.success('Organisation supprimée avec succès');
      
      // Rediriger vers la page de connexion
      setTimeout(() => {
        window.location.href = '/login';
      }, 1000);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Une erreur est survenue';
      setError(errorMsg);
      toast.error(errorMsg);
      setShowDeleteConfirm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentCompany) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Chargement des informations de l'organisation...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Settings */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Informations de l'entreprise</h2>
                <p className="text-sm text-gray-600">Gérez les détails de votre organisation</p>
              </div>
            </div>
            {isOwner() && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Crown className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">Propriétaire</span>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          {/* Logo Upload */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-purple-600 rounded"></div>
              Logo de l'entreprise
            </h3>
            
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-10 h-10 text-gray-400" />
                )}
              </div>
              {canEditOrganization() && (
                <label className="flex-1 cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-purple-500 transition-colors">
                    <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm text-gray-600">Cliquer pour modifier</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG (max 2MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-purple-600 rounded"></div>
              Détails de l'entreprise
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'entreprise <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                  disabled={!canEditOrganization()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro fiscal (NIF)
                </label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  placeholder="0000000000000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                  disabled={!canEditOrganization()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@entreprise.mg"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                  disabled={!canEditOrganization()}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Antananarivo, Madagascar"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                  disabled={!canEditOrganization()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+261 20 00 000 00"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all disabled:bg-gray-50 disabled:text-gray-500"
                  disabled={!canEditOrganization()}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          {canEditOrganization() && (
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/30 transition-all hover:scale-105 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          )}

          {!canEditOrganization() && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-gray-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-900">Permissions limitées</p>
                <p className="text-sm text-gray-600 mt-1">
                  Vous ne pouvez pas modifier ces paramètres. Contactez un administrateur ou le propriétaire de l'organisation.
                </p>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Danger Zone */}
      {canDeleteOrganization() && (
        <div className="bg-white rounded-xl shadow-lg border border-red-200 p-6">
          <h2 className="text-lg font-semibold text-red-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Zone dangereuse
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            La suppression de l'organisation est irréversible. Toutes les données seront perdues.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer l'organisation
            </button>
          ) : (
            <div className="bg-red-50 rounded-lg p-4 space-y-3">
              <p className="text-sm font-medium text-red-900">
                Êtes-vous absolument sûr ?
              </p>
              <p className="text-sm text-red-700">
                Cette action ne peut pas être annulée. Toutes les factures, partenaires, 
                et données associées seront définitivement supprimées.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteOrganization}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Suppression...' : 'Oui, supprimer'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Les autres sections restent inchangées...
// (Je les inclus pour que le fichier soit complet)

function UtilisateursSection() {
  const utilisateurs = [
    { name: 'Jean Rakoto', email: 'jean@example.mg', role: 'Admin', status: 'Actif', avatar: 'JR' },
    { name: 'Marie Rabe', email: 'marie@example.mg', role: 'Manager', status: 'Actif', avatar: 'MR' },
    { name: 'Paul Andria', email: 'paul@example.mg', role: 'Employé', status: 'Inactif', avatar: 'PA' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Membres de l'équipe</h2>
              <p className="text-sm text-gray-600">Gérez les utilisateurs et leurs accès</p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 font-semibold shadow-lg shadow-green-500/30 transition-all hover:scale-105">
            <Plus className="w-4 h-4" />
            Ajouter un utilisateur
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {utilisateurs.map((user, index) => (
            <div 
              key={index} 
              className="group flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50/50 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {user.avatar}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{user.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                    <Mail className="w-3.5 h-3.5" />
                    {user.email}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold">
                  {user.role}
                </span>
                <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                  user.status === 'Actif'
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {user.status}
                </span>
                <button className="p-2.5 hover:bg-gray-100 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                  <Settings className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PermissionsSection() {
  const permissions = [
    { module: 'Facturation', view: true, create: true, edit: true, delete: false },
    { module: 'Clients', view: true, create: true, edit: true, delete: true },
    { module: 'Inventaire', view: true, create: false, edit: false, delete: false },
    { module: 'Comptabilité', view: true, create: true, edit: true, delete: false },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Gestion des permissions</h2>
            <p className="text-sm text-gray-600">Contrôlez les accès et les permissions des utilisateurs</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-orange-600 rounded"></div>
            Permissions par module
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-50 to-amber-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Module</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Voir</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Créer</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Modifier</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-900">Supprimer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {permissions.map((perm, index) => (
                  <tr key={index} className="hover:bg-orange-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{perm.module}</td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        defaultChecked={perm.view} 
                        className="w-5 h-5 rounded-lg text-orange-600 focus:ring-orange-500 cursor-pointer" 
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        defaultChecked={perm.create} 
                        className="w-5 h-5 rounded-lg text-orange-600 focus:ring-orange-500 cursor-pointer" 
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        defaultChecked={perm.edit} 
                        className="w-5 h-5 rounded-lg text-orange-600 focus:ring-orange-500 cursor-pointer" 
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox" 
                        defaultChecked={perm.delete} 
                        className="w-5 h-5 rounded-lg text-orange-600 focus:ring-orange-500 cursor-pointer" 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 shadow-lg shadow-orange-500/30 transition-all hover:scale-105">
            <Save className="w-4 h-4" />
            Enregistrer les permissions
          </button>
        </div>
      </div>
    </div>
  );
}

function AbonnementSection() {
  const { subscription } = useAuth();
  const { getPlanLimits, getLimitUsage } = usePermissions();
  
  const limits = getPlanLimits();
  const userUsage = getLimitUsage('users');
  const articleUsage = getLimitUsage('articles');
  const invoiceUsage = getLimitUsage('invoices');

  const plans = [
    { 
      name: 'Démarrage', 
      price: '7', 
      currency: '€', 
      users: 5, 
      features: ['Factures illimitées', 'Support par e-mail', 'Application mobile'], 
      color: 'blue',
      plan: 'STARTER' 
    },
    { 
      name: 'Professionnel', 
      price: '19', 
      currency: '€', 
      users: 25, 
      features: ['Analyses avancées', 'Support prioritaire', 'Accès API'], 
      color: 'purple', 
      popular: true,
      plan: 'PROFESSIONAL'
    },
    { 
      name: 'Entreprise', 
      price: 'Sur devis', 
      currency: '', 
      users: '∞', 
      features: ['Développement personnalisé', 'Support dédié', 'Garantie SLA'], 
      color: 'orange',
      plan: 'ENTERPRISE'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold">Plan {subscription?.plan || 'STARTER'}</h2>
            </div>
            <p className="text-gray-300">
              {subscription?.status === 'TRIAL' ? 'Essai gratuit' : 'Actif'}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-xl font-bold text-sm shadow-lg ${
            subscription?.status === 'TRIAL' 
              ? 'bg-yellow-500 text-gray-900' 
              : 'bg-green-500 text-white'
          }`}>
            {subscription?.status || 'MODE TEST'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-6 p-6 bg-white/10 backdrop-blur-sm rounded-xl">
          <div>
            <p className="text-gray-300 text-sm mb-1">Utilisateurs</p>
            <p className="text-3xl font-bold">
              {userUsage?.current || 0} / {userUsage?.max === -1 ? '∞' : userUsage?.max || 5}
            </p>
          </div>
          <div>
            <p className="text-gray-300 text-sm mb-1">Articles</p>
            <p className="text-3xl font-bold">
              {articleUsage?.current || 0} / {articleUsage?.max === -1 ? '∞' : articleUsage?.max || 100}
            </p>
          </div>
          <div>
            <p className="text-gray-300 text-sm mb-1">Factures / mois</p>
            <p className="text-3xl font-bold">
              {invoiceUsage?.current || 0} / {invoiceUsage?.max === -1 ? '∞' : invoiceUsage?.max || 50}
            </p>
          </div>
        </div>

        {subscription?.plan !== 'ENTERPRISE' && (
          <button className="mt-6 w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-bold hover:shadow-2xl transition-all hover:scale-105 shadow-lg">
            Passer à la version Premium
          </button>
        )}
      </div>

      {/* Available Plans */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <div className="w-1 h-5 bg-blue-600 rounded"></div>
          Plans disponibles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`border-2 rounded-xl p-6 transition-all hover:shadow-xl ${
                plan.popular 
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 scale-105' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <span className="inline-block px-3 py-1 bg-purple-600 text-white rounded-full text-xs font-bold mb-4 shadow-lg">
                  LE PLUS POPULAIRE
                </span>
              )}
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                {plan.currency && <span className="text-gray-600 ml-1">{plan.currency}/mois</span>}
              </div>
              <p className="text-gray-600 mb-6">{plan.users} utilisateurs</p>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  subscription?.plan === plan.plan
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
                disabled={subscription?.plan === plan.plan}
              >
                {subscription?.plan === plan.plan ? 'Plan actuel' : 'Choisir ce plan'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotificationsSection() {
  const notifications = [
    { title: 'Alertes stock bas', desc: 'Soyez notifié quand un produit atteint le stock minimum', icon: AlertCircle },
    { title: 'Nouvelles factures', desc: 'Notification lors de la création d\'une nouvelle facture', icon: Mail },
    { title: 'Rappels de paiement', desc: 'Rappels automatiques pour les factures en retard', icon: Bell },
    { title: 'Activité utilisateurs', desc: 'Notifications des actions importantes des utilisateurs', icon: Users },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-pink-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 rounded-lg">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Préférences de notifications</h2>
            <p className="text-sm text-gray-600">Gérez vos paramètres de notification</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {notifications.map((notif, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl hover:border-red-200 hover:bg-red-50/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-50 rounded-xl group-hover:bg-red-100 transition-colors">
                  <notif.icon className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{notif.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{notif.desc}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThemeSection() {
  const colors = [
    { name: 'Violet', value: '#7e22ce', module: 'Facturation' },
    { name: 'Bleu', value: '#2563eb', module: 'Partenaires' },
    { name: 'Orange', value: '#ea580c', module: 'Inventaire' },
    { name: 'Sarcelle', value: '#0d9488', module: 'Comptabilité' },
    { name: 'Indigo', value: '#4f46e5', module: 'Documents' },
    { name: 'Gris', value: '#4b5563', module: 'Paramètres' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Personnalisation du thème</h2>
            <p className="text-sm text-gray-600">Personnalisez l'apparence de votre application</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-pink-600 rounded"></div>
            Couleurs par module
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {colors.map((color, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl hover:border-pink-200 hover:bg-pink-50/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl shadow-lg group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.value }}
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{color.module}</p>
                    <p className="text-sm text-gray-600">{color.name}</p>
                  </div>
                </div>
                <button className="p-2.5 hover:bg-gray-100 rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                  <Palette className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:from-pink-700 hover:to-purple-700 shadow-lg shadow-pink-500/30 transition-all hover:scale-105">
            <Save className="w-4 h-4" />
            Enregistrer le thème
          </button>
        </div>
      </div>
    </div>
  );
}

function SecuriteSection() {
  return (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Sécurité du compte</h2>
              <p className="text-sm text-gray-600">Gérez votre mot de passe et vos paramètres de sécurité</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-gray-700 rounded"></div>
              Changer le mot de passe
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe actuel <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                  placeholder="Entrez votre mot de passe actuel"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                  placeholder="Entrez votre nouveau mot de passe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                  placeholder="Confirmez votre nouveau mot de passe"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-900 shadow-lg shadow-gray-500/30 transition-all hover:scale-105">
              <Key className="w-4 h-4" />
              Mettre à jour le mot de passe
            </button>
          </div>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Smartphone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">Authentification à deux facteurs</h3>
              <p className="text-gray-600 mt-1">Ajoutez une couche de sécurité supplémentaire à votre compte</p>
            </div>
          </div>
          <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg shadow-blue-500/30 transition-all hover:scale-105">
            Activer la 2FA
          </button>
        </div>
      </div>
    </div>
  );
}
// apps/frontend/src/pages/modules/parametre/ParametreDashboard.tsx
import { useState } from 'react';
import { 
  User, Building2, Users, Shield, Bell, Palette, 
  CreditCard, Key, Smartphone, Mail, Lock,
  Save, Upload, Check, AlertCircle, Settings,
  Trash2, Plus, CheckCircle2, Crown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

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
    </div>
  );
}

// ============================================
// SECTION PROFIL
// ============================================
function ProfilSection({ user }: any) {
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    setTimeout(() => {
      setSuccessMessage('Profil mis à jour avec succès !');
      toast.success('Profil mis à jour avec succès !');
      setLoading(false);
    }, 1000);
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
              <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <button className="absolute bottom-0 right-0 p-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 shadow-lg transition-all hover:scale-110">
                <Upload className="w-4 h-4" />
              </button>
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
                defaultValue={user?.firstName}
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
                defaultValue={user?.lastName}
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
                defaultValue={user?.email}
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
                placeholder="+261 34 00 000 00"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 transition-all hover:scale-105 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SECTION ENTREPRISE
// ============================================
function EntrepriseSection() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Informations de l'entreprise</h2>
            <p className="text-sm text-gray-600">Gérez les détails de votre organisation</p>
          </div>
        </div>
      </div>

      <div className="p-6">
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
                defaultValue="SHOP RAPHIA"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro fiscal (NIF)
              </label>
              <input
                type="text"
                placeholder="0000000000000"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro STAT
              </label>
              <input
                type="text"
                placeholder="00000000000000"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse
              </label>
              <input
                type="text"
                placeholder="Antananarivo, Madagascar"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                placeholder="contact@entreprise.mg"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                placeholder="+261 20 00 000 00"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button 
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 shadow-lg shadow-purple-500/30 transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" />
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SECTION UTILISATEURS
// ============================================
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

// ============================================
// SECTION PERMISSIONS
// ============================================
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

// ============================================
// SECTION ABONNEMENT
// ============================================
function AbonnementSection() {
  const plans = [
    { name: 'Démarrage', price: '7', currency: '€', users: 5, features: ['Factures illimitées', 'Support par e-mail', 'Application mobile'], color: 'blue' },
    { name: 'Professionnel', price: '19', currency: '€', users: 25, features: ['Analyses avancées', 'Support prioritaire', 'Accès API'], color: 'purple', popular: true },
    { name: 'Entreprise', price: 'Sur devis', currency: '', users: '∞', features: ['Développement personnalisé', 'Support dédié', 'Garantie SLA'], color: 'orange' },
  ];

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              <h2 className="text-2xl font-bold">Plan Gratuit</h2>
            </div>
            <p className="text-gray-300">Essai gratuit jusqu'au 19 avril 2026</p>
          </div>
          <span className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-xl font-bold text-sm shadow-lg">
            MODE TEST
          </span>
        </div>

        <div className="grid grid-cols-3 gap-6 p-6 bg-white/10 backdrop-blur-sm rounded-xl">
          <div>
            <p className="text-gray-300 text-sm mb-1">Utilisateurs</p>
            <p className="text-3xl font-bold">3 / 3</p>
          </div>
          <div>
            <p className="text-gray-300 text-sm mb-1">Produits</p>
            <p className="text-3xl font-bold">33 / 100</p>
          </div>
          <div>
            <p className="text-gray-300 text-sm mb-1">Factures / mois</p>
            <p className="text-3xl font-bold">5 / 50</p>
          </div>
        </div>

        <button className="mt-6 w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-xl font-bold hover:shadow-2xl transition-all hover:scale-105 shadow-lg">
          Passer à la version Premium
        </button>
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
              <button className={`w-full py-3 rounded-xl font-semibold transition-all ${
                plan.popular
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}>
                Choisir ce plan
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================
// SECTION NOTIFICATIONS
// ============================================
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

// ============================================
// SECTION THEME
// ============================================
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

// ============================================
// SECTION SÉCURITÉ
// ============================================
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
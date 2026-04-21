// apps/frontend/src/pages/modules/parametre/ParametreDashboard.tsx
import { useState } from 'react';
import { 
  User, Building2, Users, Shield, Bell, Palette, 
  CreditCard, Key, Globe, Smartphone, Mail, Lock,
  Save, Upload, Check, AlertCircle, Zap, Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function ParametreDashboard() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('profil');

  const sections = [
    { id: 'profil', name: 'Mon Profil', icon: User },
    { id: 'entreprise', name: 'Entreprise', icon: Building2 },
    { id: 'utilisateurs', name: 'Utilisateurs', icon: Users },
    { id: 'permissions', name: 'Permissions', icon: Shield },
    { id: 'abonnement', name: 'Abonnement', icon: CreditCard },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'theme', name: 'Apparence', icon: Palette },
    { id: 'securite', name: 'Sécurité', icon: Lock },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Paramètres</h1>
        <p className="text-gray-600 mt-1">Gérez les paramètres de votre compte et de votre entreprise</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar de navigation */}
        <aside className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeSection === section.id
                      ? 'bg-gray-900 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="font-medium">{section.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Contenu principal */}
        <div className="flex-1">
          {activeSection === 'profil' && <ProfilSection user={user} />}
          {activeSection === 'entreprise' && <EntrepriseSection />}
          {activeSection === 'utilisateurs' && <UtilisateursSection />}
          {activeSection === 'permissions' && <PermissionsSection />}
          {activeSection === 'abonnement' && <AbonnementSection />}
          {activeSection === 'notifications' && <NotificationsSection />}
          {activeSection === 'theme' && <ThemeSection />}
          {activeSection === 'securite' && <SecuriteSection />}
        </div>
      </div>
    </div>
  );
}

// Section Profil
function ProfilSection({ user }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <User className="w-5 h-5" />
          Informations personnelles
        </h2>

        <div className="flex items-start gap-6 mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 shadow-lg">
              <Upload className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-gray-600">{user?.email}</p>
            <span className="inline-block mt-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
              {user?.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prénom
            </label>
            <input
              type="text"
              defaultValue={user?.firstName}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom
            </label>
            <input
              type="text"
              defaultValue={user?.lastName}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              defaultValue={user?.email}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              placeholder="+261 34 00 000 00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 shadow-md">
            <Save className="w-4 h-4" />
            Enregistrer les modifications
          </button>
        </div>
      </div>
    </div>
  );
}

// Section Entreprise
function EntrepriseSection() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Informations de l'entreprise
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'entreprise
            </label>
            <input
              type="text"
              defaultValue="SHOP RAPHIA"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              NIF
            </label>
            <input
              type="text"
              placeholder="0000000000000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              STAT
            </label>
            <input
              type="text"
              placeholder="00000000000000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse
            </label>
            <input
              type="text"
              placeholder="Antananarivo, Madagascar"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="contact@entreprise.mg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              placeholder="+261 20 00 000 00"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
            <Save className="w-4 h-4" />
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

// Section Utilisateurs
function UtilisateursSection() {
  const utilisateurs = [
    { name: 'Jean Rakoto', email: 'jean@example.mg', role: 'Admin', status: 'Actif' },
    { name: 'Marie Rabe', email: 'marie@example.mg', role: 'Manager', status: 'Actif' },
    { name: 'Paul Andria', email: 'paul@example.mg', role: 'Employé', status: 'Inactif' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gestion des utilisateurs
          </h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
            <Users className="w-4 h-4" />
            Ajouter un utilisateur
          </button>
        </div>

        <div className="space-y-3">
          {utilisateurs.map((user, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {user.role}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.status === 'Actif' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {user.status}
                </span>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Settings className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Section Permissions
function PermissionsSection() {
  const permissions = [
    { module: 'Facturation', view: true, create: true, edit: true, delete: false },
    { module: 'Clients', view: true, create: true, edit: true, delete: true },
    { module: 'Stock', view: true, create: false, edit: false, delete: false },
    { module: 'Comptabilité', view: true, create: true, edit: true, delete: false },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <Shield className="w-5 h-5" />
        Gestion des permissions
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Module</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Voir</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Créer</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Modifier</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Supprimer</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {permissions.map((perm, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{perm.module}</td>
                <td className="px-6 py-4 text-center">
                  <input type="checkbox" defaultChecked={perm.view} className="rounded text-gray-900" />
                </td>
                <td className="px-6 py-4 text-center">
                  <input type="checkbox" defaultChecked={perm.create} className="rounded text-gray-900" />
                </td>
                <td className="px-6 py-4 text-center">
                  <input type="checkbox" defaultChecked={perm.edit} className="rounded text-gray-900" />
                </td>
                <td className="px-6 py-4 text-center">
                  <input type="checkbox" defaultChecked={perm.delete} className="rounded text-gray-900" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end">
        <button className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
          <Save className="w-4 h-4" />
          Enregistrer les permissions
        </button>
      </div>
    </div>
  );
}

// Section Abonnement
function AbonnementSection() {
  return (
    <div className="space-y-6">
      {/* Plan actuel */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Plan Gratuit</h2>
            <p className="text-gray-300">Essai gratuit jusqu'au 19/04/2026</p>
          </div>
          <span className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg font-bold">
            MODE TEST
          </span>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-gray-400 text-sm mb-1">Utilisateurs</p>
            <p className="text-2xl font-bold">3 / 3</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Articles</p>
            <p className="text-2xl font-bold">33 / 100</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Factures/mois</p>
            <p className="text-2xl font-bold">5 / 50</p>
          </div>
        </div>

        <button className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 rounded-lg font-bold hover:shadow-xl transition-shadow">
          Passer au plan supérieur
        </button>
      </div>

      {/* Plans disponibles */}
      <div className="grid grid-cols-3 gap-6">
        {[
          { name: 'Starter', price: '49 000', users: 10, features: ['Articles illimités', 'Support email'] },
          { name: 'Professional', price: '99 000', users: 25, features: ['Multi-entreprise', 'Support prioritaire'], popular: true },
          { name: 'Enterprise', price: 'Sur mesure', users: '∞', features: ['Personnalisation', 'Support dédié'] },
        ].map((plan, index) => (
          <div key={index} className={`bg-white rounded-xl shadow-sm border-2 p-6 ${
            plan.popular ? 'border-gray-900' : 'border-gray-200'
          }`}>
            {plan.popular && (
              <span className="inline-block px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-bold mb-4">
                POPULAIRE
              </span>
            )}
            <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
              {plan.price !== 'Sur mesure' && <span className="text-gray-600"> Ar/mois</span>}
            </div>
            <p className="text-gray-600 mb-4">{plan.users} utilisateurs</p>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <Check className="w-4 h-4 text-green-600" />
                  {feature}
                </li>
              ))}
            </ul>
            <button className={`w-full py-2 rounded-lg font-medium ${
              plan.popular
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
            }`}>
              Choisir
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Section Notifications
function NotificationsSection() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <Bell className="w-5 h-5" />
        Préférences de notifications
      </h2>

      <div className="space-y-6">
        {[
          { title: 'Alertes stock faible', desc: 'Recevoir une alerte quand un article atteint le stock minimum', icon: AlertCircle },
          { title: 'Nouvelles factures', desc: 'Notification lors de la création d\'une nouvelle facture', icon: Mail },
          { title: 'Rappels de paiement', desc: 'Rappels automatiques pour les factures échues', icon: Bell },
          { title: 'Activité utilisateurs', desc: 'Notifications des actions importantes des utilisateurs', icon: Users },
        ].map((notif, index) => (
          <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <notif.icon className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{notif.title}</h3>
                <p className="text-sm text-gray-600">{notif.desc}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-900"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

// Section Thème
function ThemeSection() {
  const colors = [
    { name: 'Violet', value: '#7e22ce', module: 'Facturation' },
    { name: 'Bleu', value: '#2563eb', module: 'Partenaires' },
    { name: 'Orange', value: '#ea580c', module: 'Inventaire' },
    { name: 'Teal', value: '#0d9488', module: 'Comptabilité' },
    { name: 'Indigo', value: '#4f46e5', module: 'Documents' },
    { name: 'Gris', value: '#4b5563', module: 'Paramètre' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <Palette className="w-5 h-5" />
        Personnalisation du thème
      </h2>

      <div className="space-y-6">
        <div>
          <h3 className="font-medium text-gray-900 mb-4">Couleurs par module</h3>
          <div className="grid grid-cols-2 gap-4">
            {colors.map((color, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg shadow-sm"
                    style={{ backgroundColor: color.value }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{color.module}</p>
                    <p className="text-sm text-gray-600">{color.name}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Palette className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Section Sécurité
function SecuriteSection() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Sécurité du compte
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe actuel
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
            />
          </div>

          <button className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
            <Key className="w-4 h-4" />
            Modifier le mot de passe
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Authentification à deux facteurs
        </h3>
        <p className="text-gray-600 mb-4">
          Ajoutez une couche de sécurité supplémentaire à votre compte
        </p>
        <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 font-medium">
          Activer 2FA
        </button>
      </div>
    </div>
  );
}
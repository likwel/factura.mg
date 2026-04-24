// apps/frontend/src/pages/NotificationsDashboard.tsx
import { useState } from 'react';
import { 
  Bell, CheckCircle, AlertCircle, Info, AlertTriangle,
  Search, Filter, Trash2, Check, CheckCheck, Archive,
  Clock, TrendingUp
} from 'lucide-react';
import type { AppNotification } from '../../types/notifications';

function StatCard({ title, value, icon: Icon, color = 'purple' }: any) {
  const colors: any = {
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      text: 'text-orange-700',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600'
    },
  };

  const theme = colors[color];

  return (
    <div className={`${theme.bg} ${theme.border} border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className={`text-sm font-medium uppercase tracking-wide mb-2 ${theme.text} opacity-70`}>
            {title}
          </p>
          <p className={`text-2xl font-bold ${theme.text}`}>
            {value}
          </p>
        </div>
        
        <div className={`${theme.iconBg} ${theme.iconColor} p-3 rounded-xl`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

export default function NotificationsDashboard() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'success' | 'warning' | 'error'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  // Données d'exemple
  const notifications: AppNotification[] = [
    {
      id: '1',
      type: 'success',
      title: 'Paiement reçu',
      message: 'Un paiement de 1 500€ a été reçu pour la facture #1234 de la part du client Jean Dupont.',
      timestamp: 'Il y a 10 min',
      read: false
    },
    {
      id: '2',
      type: 'warning',
      title: 'Stock faible - Produit A',
      message: 'Le stock de "Produit A" est inférieur à 10 unités. Pensez à réapprovisionner.',
      timestamp: 'Il y a 1h',
      read: false
    },
    {
      id: '3',
      type: 'info',
      title: 'Nouveau devis créé',
      message: 'Un nouveau devis #5678 a été créé par Marie Martin pour le client ABC Corp.',
      timestamp: 'Il y a 3h',
      read: true
    },
    {
      id: '4',
      type: 'error',
      title: 'Erreur de synchronisation',
      message: 'La synchronisation avec le système comptable a échoué. Veuillez vérifier la connexion.',
      timestamp: 'Hier à 16:45',
      read: false
    },
    {
      id: '5',
      type: 'success',
      title: 'Commande expédiée',
      message: 'La commande #9876 a été expédiée avec succès. Numéro de suivi : TR123456789.',
      timestamp: 'Hier à 14:20',
      read: true
    },
    {
      id: '6',
      type: 'warning',
      title: 'Facture en retard',
      message: 'La facture #4444 de XYZ Corp est en retard de 15 jours.',
      timestamp: 'Il y a 2 jours',
      read: true
    },
    {
      id: '7',
      type: 'info',
      title: 'Nouvelle fonctionnalité',
      message: 'Une nouvelle fonctionnalité de reporting avancé est maintenant disponible.',
      timestamp: 'Il y a 3 jours',
      read: true
    }
  ];

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-orange-600" />;
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getNotificationBg = (type: AppNotification['type'], read: boolean) => {
    if (read) return 'bg-white';
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
      case 'warning':
        return 'bg-orange-50';
      default:
        return 'bg-blue-50';
    }
  };

  const getNotificationBorder = (type: AppNotification['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200';
      case 'error':
        return 'border-red-200';
      case 'warning':
        return 'border-orange-200';
      default:
        return 'border-blue-200';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (selectedFilter === 'unread') return !notif.read;
    if (selectedFilter !== 'all') return notif.type === selectedFilter;
    return true;
  }).filter(notif => 
    notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notif.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = notifications.filter(n => !n.read).length;
  const successCount = notifications.filter(n => n.type === 'success').length;
  const warningCount = notifications.filter(n => n.type === 'warning').length;
  const errorCount = notifications.filter(n => n.type === 'error').length;

  const toggleSelectNotification = (id: string) => {
    setSelectedNotifications(prev =>
      prev.includes(id) ? prev.filter(nid => nid !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedNotifications(filteredNotifications.map(n => n.id));
  };

  const deselectAll = () => {
    setSelectedNotifications([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        <p className="text-gray-600 mt-1">Suivez toutes vos notifications et alertes</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total"
          value={notifications.length}
          icon={Bell}
          color="blue"
        />
        <StatCard
          title="Non lues"
          value={unreadCount}
          icon={AlertCircle}
          color="orange"
        />
        <StatCard
          title="Succès"
          value={successCount}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Alertes"
          value={errorCount}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une notification..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'all', label: 'Toutes', color: 'blue' },
              { id: 'unread', label: 'Non lues', color: 'orange' },
              { id: 'success', label: 'Succès', color: 'green' },
              { id: 'warning', label: 'Avertissements', color: 'orange' },
              { id: 'error', label: 'Erreurs', color: 'red' }
            ].map(filter => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedFilter === filter.id
                    ? `bg-${filter.color}-100 text-${filter.color}-700 border-2 border-${filter.color}-300`
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedNotifications.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4">
            <span className="text-sm text-gray-600 font-medium">
              {selectedNotifications.length} sélectionné{selectedNotifications.length > 1 ? 's' : ''}
            </span>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2">
                <Check className="w-4 h-4" />
                Marquer comme lu
              </button>
              <button className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
                <Archive className="w-4 h-4" />
                Archiver
              </button>
              <button className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
            <button 
              onClick={deselectAll}
              className="ml-auto text-sm text-gray-600 hover:text-gray-800"
            >
              Désélectionner tout
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Aucune notification trouvée</p>
            <p className="text-sm text-gray-400 mt-1">Modifiez vos filtres pour voir plus de résultats</p>
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="flex items-center gap-2 px-2">
              <input
                type="checkbox"
                checked={selectedNotifications.length === filteredNotifications.length}
                onChange={(e) => e.target.checked ? selectAll() : deselectAll()}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Tout sélectionner</span>
            </div>

            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`${getNotificationBg(notification.type, notification.read)} border ${getNotificationBorder(notification.type)} rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => toggleSelectNotification(notification.id)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />

                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className={`text-base font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {notification.timestamp}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {notification.message}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Marquer comme lu
                        </button>
                      )}
                      <button className="text-xs text-gray-600 hover:text-gray-700 font-medium flex items-center gap-1">
                        <Archive className="w-3 h-3" />
                        Archiver
                      </button>
                      <button className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
                        <Trash2 className="w-3 h-3" />
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
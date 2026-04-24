// apps/frontend/src/pages/MessagesDashboard.tsx
import { useState } from 'react';
import { 
  Mail, MailOpen, Star, Archive, Trash2, Search,
  Filter, ChevronLeft, Reply, Forward, MoreVertical,
  Inbox, Send, Clock, AlertCircle
} from 'lucide-react';
import type { AppMessage } from '../../types/notifications';

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

export default function MessagesDashboard() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'starred' | 'sent'>('all');
  const [selectedMessage, setSelectedMessage] = useState<AppMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Données d'exemple
  const messages: AppMessage[] = [
    {
      id: '1',
      sender: 'Jean Dupont',
      subject: 'Nouvelle commande #1234',
      preview: 'Bonjour, je vous contacte concernant la commande #1234. Pouvez-vous me confirmer la date de livraison ?',
      timestamp: 'Il y a 5 min',
      read: false,
      important: true
    },
    {
      id: '2',
      sender: 'Marie Martin',
      subject: 'Facture en attente de validation',
      preview: 'La facture #5678 nécessite votre attention pour validation avant envoi au client.',
      timestamp: 'Il y a 2h',
      read: false,
      important: false
    },
    {
      id: '3',
      sender: 'Pierre Durand',
      subject: 'Réunion confirmée - Projet Alpha',
      preview: 'La réunion de demain est confirmée à 14h dans la salle de conférence A.',
      timestamp: 'Hier à 15:30',
      read: true,
      important: false
    },
    {
      id: '4',
      sender: 'Sophie Bernard',
      subject: 'Demande de devis urgente',
      preview: 'Client important demande un devis pour une commande de 50 unités. Délai : 48h.',
      timestamp: 'Hier à 10:20',
      read: true,
      important: true
    },
    {
      id: '5',
      sender: 'Luc Moreau',
      subject: 'Mise à jour des stocks',
      preview: 'Les stocks ont été mis à jour ce matin. Veuillez vérifier les niveaux critiques.',
      timestamp: 'Il y a 2 jours',
      read: true,
      important: false
    }
  ];

  const filters = [
    { id: 'all', label: 'Tous les messages', icon: Inbox },
    { id: 'unread', label: 'Non lus', icon: Mail },
    { id: 'starred', label: 'Importants', icon: Star },
    { id: 'sent', label: 'Envoyés', icon: Send }
  ];

  const filteredMessages = messages.filter(msg => {
    if (selectedFilter === 'unread') return !msg.read;
    if (selectedFilter === 'starred') return msg.important;
    return true;
  }).filter(msg => 
    msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.sender.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = messages.filter(m => !m.read).length;
  const starredCount = messages.filter(m => m.important).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
        <p className="text-gray-600 mt-1">Gérez vos messages et communications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Messages"
          value={messages.length}
          icon={Inbox}
          color="blue"
        />
        <StatCard
          title="Non lus"
          value={unreadCount}
          icon={Mail}
          color="orange"
        />
        <StatCard
          title="Importants"
          value={starredCount}
          icon={Star}
          color="purple"
        />
        <StatCard
          title="Envoyés"
          value="12"
          icon={Send}
          color="green"
        />
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-x divide-gray-200 h-[600px]">

          {/* Messages List */}
          <div className="lg:col-span-1 overflow-y-auto">
            {/* Search */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Messages */}
            <div className="divide-y divide-gray-100">
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center">
                  <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Aucun message trouvé</p>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedMessage?.id === message.id
                        ? 'bg-blue-50 border-l-4 border-blue-600'
                        : !message.read
                        ? 'bg-blue-50/30 hover:bg-blue-50/50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
                        {message.sender.charAt(0)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className={`font-medium truncate ${!message.read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {message.sender}
                          </p>
                          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                            {message.timestamp}
                          </span>
                        </div>
                        <p className={`text-sm truncate mb-1 ${!message.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                          {message.subject}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {message.preview}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {message.important && (
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        )}
                        {!message.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2 overflow-y-auto">
            {selectedMessage ? (
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="border-b border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-4">
                    <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex gap-2 ml-auto">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Répondre">
                        <Reply className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Transférer">
                        <Forward className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Archiver">
                        <Archive className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Supprimer">
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {selectedMessage.subject}
                  </h2>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedMessage.sender.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{selectedMessage.sender}</p>
                      <p className="text-sm text-gray-500">{selectedMessage.timestamp}</p>
                    </div>
                    {selectedMessage.important && (
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 p-6">
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {selectedMessage.preview}
                    </p>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                    </p>
                    <p className="text-gray-700 leading-relaxed mt-4">
                      Cordialement,<br />
                      {selectedMessage.sender}
                    </p>
                  </div>
                </div>

                {/* Reply Box */}
                <div className="border-t border-gray-200 p-4">
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <Reply className="w-5 h-5" />
                    Répondre
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-8 text-center">
                <div>
                  <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Sélectionnez un message</p>
                  <p className="text-sm text-gray-400 mt-1">Choisissez un message pour voir son contenu</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
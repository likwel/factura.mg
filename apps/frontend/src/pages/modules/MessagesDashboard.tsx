import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Mail, Star, Archive, Trash2, Search, ChevronLeft, Reply, 
  Forward, MoreVertical, Inbox, Send, Clock, AlertCircle, Loader2,
  Paperclip, Download, X, Plus, RotateCcw, FileText, Image as ImageIcon, File, User, Check
} from 'lucide-react';
import { messageApi, Message, MessageStats, MessageStatus, AttachmentType, Attachment } from '../../services/messageApi';
import { userApi, UserOption } from '../../services/userApi';
import toast from 'react-hot-toast';

// Composant StatCard
function StatCard({ title, value, icon: Icon, color = 'purple', loading = false, onClick }: any) {
  const colors: any = {
    purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
    blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
    green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
    orange: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
    red: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100',
    gray: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
  };

  return (
    <div onClick={onClick} className={`${colors[color]} border rounded-xl p-4 cursor-pointer transition-all`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase opacity-70 mb-1">{title}</p>
          <p className="text-2xl font-bold">{loading ? '...' : value}</p>
        </div>
        <Icon className="w-8 h-8 opacity-50" />
      </div>
    </div>
  );
}

// Composant pour les pièces jointes
function AttachmentPreview({ attachment, onDownload, onRemove }: any) {
  const getIcon = () => {
    if (attachment.type === AttachmentType.IMAGE) return <ImageIcon className="w-5 h-5" />;
    if (attachment.type === AttachmentType.DOCUMENT) return <FileText className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="text-blue-600">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{attachment.originalName}</p>
        <p className="text-xs text-gray-500">{formatSize(attachment.fileSize)}</p>
      </div>
      {onDownload && (
        <button onClick={() => onDownload(attachment)} className="p-1 hover:bg-gray-200 rounded">
          <Download className="w-4 h-4 text-gray-600" />
        </button>
      )}
      {onRemove && (
        <button onClick={() => onRemove(attachment)} className="p-1 hover:bg-gray-200 rounded">
          <X className="w-4 h-4 text-gray-600" />
        </button>
      )}
    </div>
  );
}

// Composant sélecteur d'utilisateur
function UserSelector({ onSelect, selectedUserId }: { onSelect: (user: UserOption) => void, selectedUserId: string }) {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [searchUser, setSearchUser] = useState('');
  const [loading, setLoading] = useState(false);

  // Charger les vrais utilisateurs depuis l'API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const usersData = await userApi.getCompanyUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    user.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  return (
    <div className="border-b border-gray-200 p-4">
      <label className="text-sm font-medium text-gray-700 mb-2 block">Destinataire</label>
      
      {selectedUserId ? (
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
            {users.find(u => u.id === selectedUserId)?.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900">{users.find(u => u.id === selectedUserId)?.name}</p>
            <p className="text-sm text-gray-600">{users.find(u => u.id === selectedUserId)?.email}</p>
          </div>
          <button
            onClick={() => onSelect({ id: '', name: '', email: '' })}
            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      ) : (
        <>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 mx-auto mb-2 text-blue-600 animate-spin" />
                <p className="text-sm text-gray-500">Chargement des utilisateurs...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Aucun utilisateur trouvé</p>
              </div>
            ) : (
              filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => onSelect(user)}
                  className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function MessagesDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const getCurrentFilter = () => {
    const path = location.pathname;
    if (path === '/app/messages' || path === '/app/messages/inbox') return 'inbox';
    if (path === '/app/messages/unread') return 'unread';
    if (path === '/app/messages/starred') return 'starred';
    if (path === '/app/messages/sent') return 'sent';
    if (path === '/app/messages/drafts') return 'drafts';
    if (path === '/app/messages/archived') return 'archived';
    if (path === '/app/messages/trash') return 'trash';
    return 'inbox';
  };

  const currentFilter = getCurrentFilter();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isComposing, setIsComposing] = useState(false);
  const [newMessage, setNewMessage] = useState({
    receiverId: '',
    subject: '',
    content: '',
    isImportant: false,
    isDraft: false,
    attachments: [] as File[]
  });

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await messageApi.getMessages({
        status: currentFilter,
        search: searchTerm || undefined
      });
      setMessages(data.messages);
    } catch (err: any) {
      console.error('Error loading messages:', err);
      setError(err.response?.data?.error || 'Erreur lors du chargement des messages');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const statsData = await messageApi.getStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('Error loading stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [currentFilter]);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== undefined) {
        loadMessages();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelectMessage = async (message: Message) => {
    setSelectedMessage(message);
    setIsComposing(false);
    
    if (!message.isRead && message.status === MessageStatus.SENT) {
      try {
        await messageApi.updateMessage(message.id, { isRead: true });
        setMessages(prev => prev.map(m => m.id === message.id ? { ...m, isRead: true } : m));
        loadStats();
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    }
  };

  const handleToggleImportant = async (messageId: string, currentState: boolean) => {
    try {
      setActionLoading(true);
      await messageApi.updateMessage(messageId, { isImportant: !currentState });
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isImportant: !currentState } : m));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, isImportant: !currentState } : null);
      }
      loadStats();
    } catch (err: any) {
      console.error('Error toggling important:', err);
      toast.error(err.response?.data?.error || 'Erreur lors de la mise à jour')
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async (messageId: string) => {
    try {
      setActionLoading(true);
      await messageApi.updateMessage(messageId, { status: MessageStatus.ARCHIVED });
      setMessages(prev => prev.filter(m => m.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
      loadStats();
    } catch (err: any) {
      console.error('Error archiving:', err);
      toast.error(err.response?.data?.error || 'Erreur lors de l\'archivage')
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('Déplacer ce message vers la corbeille ?')) return;
    try {
      setActionLoading(true);
      await messageApi.deleteMessage(messageId, false);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
      loadStats();
    } catch (err: any) {
      console.error('Error deleting:', err);
      toast.error(err.response?.data?.error || 'Erreur lors de la suppression')
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async (messageId: string) => {
    try {
      setActionLoading(true);
      await messageApi.restoreFromTrash(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
      loadStats();
    } catch (err: any) {
      console.error('Error restoring:', err);
      toast.error(err.response?.data?.error || 'Erreur lors de la restauration')
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmptyTrash = async () => {
    if (!confirm('Supprimer définitivement tous les messages de la corbeille ?')) return;
    try {
      setActionLoading(true);
      await messageApi.emptyTrash();
      setMessages([]);
      setSelectedMessage(null);
      loadStats();
      toast.success('Corbeille vidée avec succès')
    } catch (err: any) {
      console.error('Error emptying trash:', err);
      toast.error(err.response?.data?.error || 'Erreur lors du vidage de la corbeille')
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadAttachment = async (attachment: Attachment) => {
    try {
      await messageApi.downloadAttachment(attachment);
    } catch (err) {
      console.error('Error downloading attachment:', err);
      toast.error('Erreur lors du téléchargement')
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (newMessage.attachments.length + filesArray.length > 5) {
        toast.error('Maximum 5 fichiers autorisés')
        return;
      }
      const oversized = filesArray.find(f => f.size > 10 * 1024 * 1024);
      if (oversized) {
        toast.error('Taille maximale par fichier : 10 MB')
        return;
      }
      setNewMessage(prev => ({ ...prev, attachments: [...prev.attachments, ...filesArray] }));
    }
  };

  const removeAttachment = (index: number) => {
    setNewMessage(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const handleSend = async (isDraft: boolean) => {
    try {
      setActionLoading(true);
      await messageApi.createMessage({ ...newMessage, isDraft });
      setIsComposing(false);
      setNewMessage({ receiverId: '', subject: '', content: '', isImportant: false, isDraft: false, attachments: [] });
      loadMessages();
      loadStats();
      toast.success(isDraft ? 'Brouillon enregistré' : 'Message envoyé')
    } catch (err: any) {
      console.error('Error sending message:', err);
      toast.error(err.response?.data?.error || 'Erreur lors de l\'envoi')
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartCompose = () => {
    setIsComposing(true);
    setSelectedMessage(null);
    setNewMessage({ receiverId: '', subject: '', content: '', isImportant: false, isDraft: false, attachments: [] });
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMs / 3600000);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return date.toLocaleDateString('fr-FR');
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      inbox: 'Boîte de réception',
      unread: 'Messages non lus',
      starred: 'Messages importants',
      sent: 'Messages envoyés',
      drafts: 'Brouillons',
      archived: 'Messages archivés',
      trash: 'Corbeille'
    };
    return titles[currentFilter] || 'Messages';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{getPageTitle()}</h1>
            <p className="text-gray-600 mt-1">Gérez vos communications</p>
          </div>
          <div className="flex gap-3">
            {currentFilter === 'trash' && (
              <button onClick={handleEmptyTrash} disabled={actionLoading || messages.length === 0} className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Vider la corbeille
              </button>
            )}
            <button onClick={handleStartCompose} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Nouveau message
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 hidden">
          <StatCard title="Boîte" value={stats?.inbox || 0} icon={Inbox} color="blue" loading={statsLoading} onClick={() => navigate('/app/messages/inbox')} />
          <StatCard title="Non lus" value={stats?.unread || 0} icon={Mail} color="orange" loading={statsLoading} onClick={() => navigate('/app/messages/unread')} />
          <StatCard title="Importants" value={stats?.starred || 0} icon={Star} color="purple" loading={statsLoading} onClick={() => navigate('/app/messages/starred')} />
          <StatCard title="Envoyés" value={stats?.sent || 0} icon={Send} color="green" loading={statsLoading} onClick={() => navigate('/app/messages/sent')} />
          <StatCard title="Brouillons" value={stats?.drafts || 0} icon={Clock} color="gray" loading={statsLoading} onClick={() => navigate('/app/messages/drafts')} />
          <StatCard title="Archivés" value={stats?.archived || 0} icon={Archive} color="blue" loading={statsLoading} onClick={() => navigate('/app/messages/archived')} />
          <StatCard title="Corbeille" value={stats?.trash || 0} icon={Trash2} color="red" loading={statsLoading} onClick={() => navigate('/app/messages/trash')} />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 divide-x divide-gray-200 h-[600px]">
            <div className="lg:col-span-1 overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-3 animate-spin" />
                    <p className="text-gray-500">Chargement...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="p-8 text-center">
                    <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Aucun message</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} onClick={() => handleSelectMessage(message)} className={`p-4 cursor-pointer transition-colors ${selectedMessage?.id === message.id ? 'bg-blue-50 border-l-4 border-blue-600' : !message.isRead ? 'bg-blue-50/30 hover:bg-blue-50/50' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
                          {message.sender.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <p className={`font-medium truncate ${!message.isRead ? 'text-gray-900' : 'text-gray-700'}`}>{message.sender.name}</p>
                            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{formatTimestamp(message.createdAt)}</span>
                          </div>
                          <p className={`text-sm truncate mb-1 ${!message.isRead ? 'font-medium text-gray-900' : 'text-gray-600'}`}>{message.subject}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-gray-500 truncate flex-1">{message.content.substring(0, 60)}...</p>
                            {message.attachments.length > 0 && <Paperclip className="w-3 h-3 text-gray-400 flex-shrink-0" />}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {message.isImportant && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                          {!message.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full"></div>}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col h-full">
              {isComposing ? (
                <>
                  <div className="border-b border-gray-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setIsComposing(false)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <h2 className="text-xl font-bold text-gray-900">Nouveau message</h2>
                    </div>
                    <button onClick={() => setIsComposing(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                      <X className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <UserSelector selectedUserId={newMessage.receiverId} onSelect={(user) => setNewMessage(prev => ({ ...prev, receiverId: user.id }))} />

                  <div className="border-b border-gray-200 p-4 space-y-3">
                    <input type="text" placeholder="Sujet" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={newMessage.subject} onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })} />
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={newMessage.isImportant} onChange={(e) => setNewMessage({ ...newMessage, isImportant: e.target.checked })} className="rounded" />
                      <Star className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-700">Marquer comme important</span>
                    </label>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto">
                    <textarea placeholder="Écrivez votre message..." className="w-full h-full resize-none border border-gray-300 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500" value={newMessage.content} onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })} />
                  </div>

                  {newMessage.attachments.length > 0 && (
                    <div className="border-t border-gray-200 p-4 space-y-2 max-h-48 overflow-y-auto">
                      {newMessage.attachments.map((file, index) => (
                        <AttachmentPreview key={index} attachment={{ originalName: file.name, fileSize: file.size, type: file.type.startsWith('image/') ? AttachmentType.IMAGE : AttachmentType.FILE }} onRemove={() => removeAttachment(index)} />
                      ))}
                    </div>
                  )}

                  <div className="border-t border-gray-200 p-4">
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Paperclip className="w-5 h-5 text-gray-600" />
                        <input type="file" multiple className="hidden" onChange={handleFileSelect} accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" />
                      </label>
                      <div className="flex-1"></div>
                      <button onClick={() => handleSend(true)} disabled={actionLoading || !newMessage.subject} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-700 rounded-lg">Brouillon</button>
                      <button onClick={() => handleSend(false)} disabled={actionLoading || !newMessage.subject || !newMessage.content || !newMessage.receiverId} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg flex items-center gap-2">
                        {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        Envoyer
                      </button>
                    </div>
                  </div>
                </>
              ) : selectedMessage ? (
                <>
                  <div className="border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <button className="lg:hidden p-2 hover:bg-gray-100 rounded-lg" onClick={() => setSelectedMessage(null)}><ChevronLeft className="w-5 h-5" /></button>
                      <div className="flex gap-2 ml-auto">
                        {currentFilter === 'trash' ? (
                          <button onClick={() => handleRestore(selectedMessage.id)} disabled={actionLoading} className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50" title="Restaurer"><RotateCcw className="w-5 h-5 text-gray-600" /></button>
                        ) : (
                          <>
                            <button onClick={() => handleToggleImportant(selectedMessage.id, selectedMessage.isImportant)} disabled={actionLoading} className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"><Star className={`w-5 h-5 ${selectedMessage.isImportant ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} /></button>
                            <button className="p-2 hover:bg-gray-100 rounded-lg"><Reply className="w-5 h-5 text-gray-600" /></button>
                            <button onClick={() => handleArchive(selectedMessage.id)} disabled={actionLoading} className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"><Archive className="w-5 h-5 text-gray-600" /></button>
                            <button onClick={() => handleDelete(selectedMessage.id)} disabled={actionLoading} className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"><Trash2 className="w-5 h-5 text-red-600" /></button>
                          </>
                        )}
                      </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">{selectedMessage.subject}</h2>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">{selectedMessage.sender.name.charAt(0)}</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{selectedMessage.sender.name}</p>
                        <p className="text-sm text-gray-500">{selectedMessage.sender.email}</p>
                      </div>
                      <p className="text-sm text-gray-500">{formatTimestamp(selectedMessage.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex-1 p-6 overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedMessage.content}</p>
                    </div>
                    {selectedMessage.attachments.length > 0 && (
                      <div className="mt-6 space-y-2">
                        <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Paperclip className="w-4 h-4" />
                          Pièces jointes ({selectedMessage.attachments.length})
                        </p>
                        {selectedMessage.attachments.map(att => <AttachmentPreview key={att.id} attachment={att} onDownload={handleDownloadAttachment} />)}
                      </div>
                    )}
                  </div>

                  {currentFilter !== 'trash' && (
                    <div className="border-t border-gray-200 p-4">
                      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2">
                        <Reply className="w-5 h-5" />
                        Répondre
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Sélectionnez un message</p>
                    <p className="text-sm text-gray-400 mt-2">ou</p>
                    <button onClick={handleStartCompose} className="mt-4 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mx-auto">
                      <Plus className="w-5 h-5" />
                      Composez un nouveau message
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
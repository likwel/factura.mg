// apps/frontend/src/components/layout/ModuleSidebar.tsx
import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, Plus, LayoutDashboard, FileText, 
  Package, Users, ShoppingCart, Receipt, Building2,
  Warehouse, TrendingUp, CreditCard, Calendar,
  FileStack, Settings as SettingsIcon, BookOpen,
  FileEdit, List, BarChart3, Wallet, Truck, RotateCcw, ChevronRight, LogOut,
  ChevronDown, Check, Search, ChevronsUpDown, ChevronsDownUp, PanelLeft, Globe, HelpCircle, Star, Info, Settings, Download,
  User, Shield, Bell, MessagesSquare, Palette,
  FileSignature, Inbox, Mail, Clock, Archive, Trash2,
  Repeat, AlertCircle, CheckCircle, AlertTriangle, Crown,
  ClipboardList,
  ArrowRightLeft,
  Send,
  RefreshCw,
  ShoppingBag,
  Boxes,
  MapPin,
  FileSpreadsheet, 
  Settings2} from 'lucide-react';

import { getModuleColor, moduleThemes } from '../shared/moduleThemes';
import type { ModuleKey } from '../shared/moduleThemes';
import { useAuth } from '../../contexts/AuthContext';

// Type pour les items du menu
interface MenuItem {
  name: string;
  path: string;
  icon: any;
  hasAdd?: boolean;
  exact?: boolean;
  section?: string;
}

// Type pour les menus par module
interface ModuleMenus {
  [key: string]: MenuItem[];
}

const moduleMenus: ModuleMenus = {
  facturation: [
    { name: 'Tableau de bord', path: '/app/facturation', icon: LayoutDashboard, exact: true },
    { name: 'Devis', path: '/app/facturation/devis', icon: FileSignature, hasAdd: true },
    { name: 'Factures', path: '/app/facturation/factures', icon: Receipt, hasAdd: true },
    { name: 'Récurrentes', path: '/app/facturation/recurrentes', icon: Repeat, hasAdd: true },
    { name: 'Articles', path: '/app/facturation/articles', icon: Package, hasAdd: true },
    { name: 'Factures d\'achat', path: '/app/facturation/achats', icon: ShoppingBag, hasAdd: true },
    { name: 'Note de frais', path: '/app/facturation/frais', icon: CreditCard, hasAdd: true },
  ],
  partenaires: [
    { name: 'Tableau de bord', path: '/app/partenaires', icon: LayoutDashboard, exact: true },
    { name: 'Clients', path: '/app/partenaires/clients', icon: Users, hasAdd: true },
    { name: 'Fournisseurs', path: '/app/partenaires/fournisseurs', icon: Building2, hasAdd: true },
    { name: 'Factures client', path: '/app/partenaires/ventes', icon: Receipt, hasAdd: true },
    { name: 'Factures d\'achat', path: '/app/partenaires/achats', icon: ShoppingBag, hasAdd: true },
  ],
  inventaire: [
    { name: 'Tableau de bord', path: '/app/inventaire', icon: LayoutDashboard, exact: true },
    { name: 'Stock actuel', path: '/app/inventaire/stock', icon: Boxes, hasAdd: true },
    { name: 'Emplacement', path: '/app/inventaire/emplacements', icon: MapPin, hasAdd: true },
    { name: 'Inventaire', path: '/app/inventaire/inventaire', icon: ClipboardList, hasAdd: true },
    { name: 'Ajustement', path: '/app/inventaire/ajustement', icon: Settings, hasAdd: true },
    { name: 'Transfert', path: '/app/inventaire/transfert', icon: ArrowRightLeft, hasAdd: true },
    { name: 'Documents', path: '/app/inventaire/documents', icon: FileStack, hasAdd: true },
  ],
  comptabilite: [
    { name: 'Tableau de bord', path: '/app/comptabilite', icon: LayoutDashboard, exact: true },
    { name: 'Journaux', path: '/app/comptabilite/journaux', icon: BookOpen, hasAdd: true },
    { name: 'Écritures', path: '/app/comptabilite/ecritures', icon: FileEdit, hasAdd: true },
    { name: 'Plan comptable', path: '/app/comptabilite/plan', icon: List, hasAdd: true },
    { name: 'États', path: '/app/comptabilite/etats', icon: FileSpreadsheet, hasAdd: true },
    { name: 'Trésorerie', path: '/app/comptabilite/tresorerie', icon: Wallet, hasAdd: true },
    { name: 'Paramètres', path: '/app/comptabilite/parametres', icon: Settings, hasAdd: true },
  ],
  documents: [
    { name: 'Tableau de bord', path: '/app/documents', icon: LayoutDashboard, exact: true },
    { name: 'Devis', path: '/app/documents/devis', icon: FileSignature, hasAdd: true, section: 'VENTES' },
    { name: 'Commandes', path: '/app/documents/commandes', icon: ShoppingCart, hasAdd: true },
    { name: 'Factures', path: '/app/documents/factures', icon: Receipt, hasAdd: true },
    { name: 'Bon de livraison', path: '/app/documents/livraison', icon: Truck, hasAdd: true },
    { name: 'Avoirs', path: '/app/documents/avoirs', icon: RefreshCw, hasAdd: true },
    { name: 'Expédition', path: '/app/documents/expedition', icon: Send, hasAdd: true },
  ],
  parametre: [
    { name: 'Mon Profil', path: '/app/parametre', icon: User, exact: true },
    { name: 'Entreprise', path: '/app/parametre/entreprise', icon: Building2 },
    { name: 'Utilisateurs', path: '/app/parametre/utilisateurs', icon: Users, hasAdd: true },
    { name: 'Permissions', path: '/app/parametre/permissions', icon: Shield, hasAdd: true },
    { name: 'Abonnement', path: '/app/parametre/abonnement', icon: CreditCard, hasAdd: true },
    { name: 'Notifications', path: '/app/parametre/notifications', icon: Bell },
    { name: 'Messages', path: '/app/parametre/messages', icon: MessagesSquare },
    { name: 'Sécurité', path: '/app/parametre/securite', icon: Shield },
    { name: 'Apparence', path: '/app/parametre/theme', icon: Palette },
    { name: 'Numérotation', path: '/app/parametre/numerotation', icon: Settings2 },
  ],
  messages: [
    { name: 'Tableau de bord', path: '/app/messages', icon: LayoutDashboard, exact: true },
    { name: 'Boîte de réception', path: '/app/messages/inbox', icon: Inbox, section: 'MESSAGES' },
    { name: 'Non lus', path: '/app/messages/unread', icon: Mail },
    { name: 'Importants', path: '/app/messages/starred', icon: Star },
    { name: 'Envoyés', path: '/app/messages/sent', icon: Send },
    { name: 'Brouillons', path: '/app/messages/drafts', icon: Clock },
    { name: 'Archivés', path: '/app/messages/archived', icon: Archive },
    { name: 'Corbeille', path: '/app/messages/trash', icon: Trash2 },
  ],
  notifications: [
    { name: 'Tableau de bord', path: '/app/notifications', icon: LayoutDashboard, exact: true },
    { name: 'Toutes', path: '/app/notifications/all', icon: Bell, section: 'NOTIFICATIONS' },
    { name: 'Non lues', path: '/app/notifications/unread', icon: AlertCircle },
    { name: 'Succès', path: '/app/notifications/success', icon: CheckCircle },
    { name: 'Avertissements', path: '/app/notifications/warnings', icon: AlertTriangle },
    { name: 'Erreurs', path: '/app/notifications/errors', icon: AlertCircle },
    { name: 'Informations', path: '/app/notifications/info', icon: Info },
    { name: 'Archivées', path: '/app/notifications/archived', icon: Archive },
  ],
};

interface ModuleSidebarProps {
  moduleId: ModuleKey;
  onAddItem?: (itemName: string, itemPath: string) => void;
  onAddCompany?: () => void;
}

export default function ModuleSidebar({ 
  moduleId, 
  onAddItem,
  onAddCompany
}: ModuleSidebarProps) {
  const navigate = useNavigate();
  const { user, currentCompany, currentMembership, switchCompany, logout, subscription } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Calculer les initiales depuis user
  const userInitials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : (user?.email?.[0] || 'U').toUpperCase();

  // Nom complet de l'utilisateur
  const userName = user?.firstName && user?.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user?.email || 'Utilisateur';

  const userEmail = user?.email || 'Utilisateur';

  // Plan de l'utilisateur
  const userPlan = subscription?.plan || user?.currentPlan || "STARTER";
  
  const menuItems = moduleMenus[moduleId] || moduleMenus.facturation;
  const color = getModuleColor(moduleId);
  
  // Menu items pour le popup utilisateur
  const userMenuItems = [
    { icon: SettingsIcon, label: 'Paramètres', shortcut: '⌘+Ctrl+,', hasArrow: false, isSpecial: false, url: '/app/parametre' },
    { icon: Globe, label: 'Langue', hasArrow: true, isSpecial: false, url: '/app/parametre/langue' },
    { icon: HelpCircle, label: "Obtenir de l'aide", hasArrow: false, isSpecial: false, url: '/app/aide' },
    { icon: Star, label: "Mettre à niveau l'abonnement", hasArrow: false, isSpecial: true, url: '/app/parametre/abonnement' },
    { icon: Info, label: 'En savoir plus', hasArrow: true, isSpecial: false, url: '/app/about' },
  ];

  // Générer les initiales de la company
  const getCompanyInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
  };

  // Couleurs par défaut pour les companies
  const companyColors = ['#9333ea', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Fermer les dropdowns quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCompanyDropdown(false);
        setSearchTerm('');
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Classes Tailwind pour les couleurs
  const getColorClasses = (color: string) => {
    const classes: { [key: string]: { bg: string; text: string; border: string; buttonBg: string; buttonHover: string } } = {
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-600',
        buttonBg: 'bg-purple-600',
        buttonHover: 'hover:bg-purple-700'
      },
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-600',
        buttonBg: 'bg-blue-600',
        buttonHover: 'hover:bg-blue-700'
      },
      orange: {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-600',
        buttonBg: 'bg-orange-600',
        buttonHover: 'hover:bg-orange-700'
      },
      teal: {
        bg: 'bg-teal-50',
        text: 'text-teal-700',
        border: 'border-teal-600',
        buttonBg: 'bg-teal-600',
        buttonHover: 'hover:bg-teal-700'
      },
      gray: {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-600',
        buttonBg: 'bg-gray-600',
        buttonHover: 'hover:bg-gray-700'
      },
    };
    return classes[color] || classes.purple;
  };

  const colorClasses = getColorClasses(color);

  const handleCompanySwitch = async (companyId: string) => {
    try {
      await switchCompany(companyId);
      setShowCompanyDropdown(false);
      setSearchTerm('');
    } catch (error) {
      console.error('Erreur lors du changement de company:', error);
    }
  };

  const handleAddCompany = () => {
    setShowCompanyDropdown(false);
    setSearchTerm('');
    onAddCompany?.();
  };

  const filteredCompanies = user?.companyMemberships.filter(m =>
    m.company.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (!user || !currentCompany) {
    return null;
  }

  return (
    <>
      {/* Animation CSS pour le dropdown */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.2s ease-out;
        }
      `}</style>
      
      <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col relative`}>
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="my-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm items-center gap-2 transition-colors"
        >
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <img src="/logo.png" alt="Logo" className="h-12" />
            )}
            <PanelLeft className="w-6 h-6 cursor-pointer" />
          </div>
        </button>

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const hasAddButton = item.hasAdd === true;
            
            return (
              <div key={index}>
                {!isCollapsed && item.section && index > 0 && (
                  <div className="px-4 py-2 mt-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {item.section}
                  </div>
                )}
                
                <div className="relative group">
                  {/* ✅ Conteneur flex pour NavLink et bouton côte à côte */}
                  <div className="flex items-center gap-1">
                    <NavLink
                      to={item.path}
                      end={item.exact}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative flex-1 ${
                          isActive
                            ? `${colorClasses.bg} ${colorClasses.text} font-medium active-menu`
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        } ${isCollapsed ? 'justify-center' : ''}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && !isCollapsed && (
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorClasses.buttonBg} rounded-r-full active-border`}></div>
                          )}
                          
                          <Icon className="w-5 h-5 flex-shrink-0" />
                          
                          {!isCollapsed && <span className="flex-1 font-medium">{item.name}</span>}
                          
                          {isCollapsed && (
                            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                              {item.name}
                              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                            </div>
                          )}
                        </>
                      )}
                    </NavLink>
                    
                    {/* ✅ Bouton d'ajout SORTI du NavLink */}
                    {hasAddButton && !isCollapsed && (
                      <button
                        className={`p-1 addBtn text-white rounded-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 flex-shrink-0`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`${item.path}/new`);
                          onAddItem?.(item.name, item.path);
                        }}
                        title={`Ajouter ${item.name}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Profile Section */}
        {!isCollapsed ? (
          <div className="border-t border-gray-200 relative" ref={userMenuRef}>
            {showUserMenu && (
              <div className="absolute bottom-full left-2 right-2 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden animate-slideUp">
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="text-gray-600 text-sm truncate">{userEmail}</div>
                </div>

                <div className="py-1 max-h-80 overflow-y-auto">
                  {userMenuItems.map((item, index) => (
                    <NavLink
                      key={index}
                      to={item.url}
                      onClick={() => setShowUserMenu(false)}
                      className={`w-full px-4 py-2.5 flex items-center justify-between hover:bg-gray-50 transition-colors text-left group ${
                        item.isSpecial ? 'bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-4 h-4 ${item.isSpecial ? 'text-orange-500' : 'text-gray-500'}`} />
                        <span className={`text-sm ${item.isSpecial ? 'text-orange-700 font-medium' : 'text-gray-700'}`}>
                          {item.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.shortcut && (
                          <span className="text-gray-400 text-xs">{item.shortcut}</span>
                        )}
                        {item.hasArrow && (
                          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                        )}
                        {item.isSpecial && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                            Premium
                          </span>
                        )}
                      </div>
                    </NavLink>
                  ))}

                  <div className="my-1 border-t border-gray-200"></div>

                  <button 
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 transition-colors text-left text-red-600 group"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Se déconnecter</span>
                  </button>
                </div>
              </div>
            )}

            {/* ✅ Container principal remplacé par un div */}
            <div className="w-full px-3 py-2 flex items-center gap-3 hover:bg-gray-50 transition-colors rounded-lg">
              {/* Avatar et nom cliquable pour ouvrir le menu */}
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {userInitials}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-medium text-gray-800 truncate text-sm">{userName}</p>
                  <p className="text-gray-500 text-xs truncate">Plan {userPlan}</p>
                </div>
              </button>
              
              {/* Boutons d'action séparés */}
              <div className="flex items-center gap-2">
                {subscription?.isOwner && (
                  <div className="relative group">
                    <NavLink
                      to="/app/parametre/abonnement"
                      className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300 relative block"
                    >
                      <Download className="w-4 h-4 text-gray-600" />
                      {/* Dot animé pour attirer l'attention */}
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                      </span>
                    </NavLink>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                      Passer au plan supérieur
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
                
                {/* Icône chevron pour le menu */}
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-1"
                >
                  <ChevronsUpDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="px-3 py-2 border-t border-gray-200">
            <div className="flex flex-col items-center gap-2">
              {subscription?.isOwner && (
                <div className="relative group p-1"> {/* p-1 pour laisser de l'espace au badge */}
                  <NavLink
                    to="/app/parametre/abonnement"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300 relative block overflow-visible"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                    <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3"> {/* légèrement décalé */}
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                    </span>
                  </NavLink>
                </div>
              )}
              
              <div className="relative group">
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm hover:ring-2 hover:ring-purple-300 transition-all"
                >
                  {userInitials}
                </button>
                
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {userName}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
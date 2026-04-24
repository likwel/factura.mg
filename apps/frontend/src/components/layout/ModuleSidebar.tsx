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
  Repeat, AlertCircle, CheckCircle, AlertTriangle, 
  
  ClipboardList,
  ArrowRightLeft,
  Send,
  RefreshCw,
  ShoppingBag,
  Boxes,
  MapPin,
  FileSpreadsheet } from 'lucide-react';

import { getModuleColor, moduleThemes } from '../shared/moduleThemes';
import type { ModuleKey } from '../shared/moduleThemes';

// Type pour les entreprises
interface Company {
  id: string;
  name: string;
  initials: string;
  color: string;
  notifications?: number;
}

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
    { name: 'Factures client', path: '/app/partenaires/factures', icon: Receipt, hasAdd: true },
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
    { name: 'Langue', path: '/app/parametre/langue', icon: Globe },
    // { name: 'Paramètres', path: '/app/parametre/settings', icon: Settings },
  ],
   // Nouveau : Messages
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

  // Nouveau : Notifications
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

const moduleColors: { [key: string]: string } = {
  facturation: 'purple',
  partenaires: 'blue',
  inventaire: 'orange',
  comptabilite: 'teal',
  documents: 'blue',
  parametre: 'gray',
};

interface ModuleSidebarProps {
  companyName: string;
  moduleId: ModuleKey;
  companies?: Company[];
  selectedCompanyId?: string;
  onCompanyChange?: (companyId: string) => void;
  onAddItem?: (itemName: string, itemPath: string) => void;
  onAddCompany?: () => void;
  userEmail?: string;
  userName?: string;
  userPlan?: string;
}

export default function ModuleSidebar({ 
  companyName, 
  moduleId, 
  companies = [],
  selectedCompanyId,
  onCompanyChange,
  onAddItem,
  onAddCompany,
  userEmail = "eliefenohasina@gmail.com",
  userName = "Elie",
  userPlan = "Forfait Free"
}: ModuleSidebarProps) {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const menuItems = moduleMenus[moduleId] || moduleMenus.facturation;
  // const color = moduleColors[moduleId] || 'purple';
  const color = getModuleColor(moduleId); // Retourne 'purple', 'blue', etc.
  
  // Menu items pour le popup utilisateur
  const userMenuItems = [
    { icon: SettingsIcon, label: 'Paramètres', shortcut: '⌘+Ctrl+,', hasArrow: false, isSpecial: false, url: '/app/parametre/profil' },
    { icon: Globe, label: 'Langue', hasArrow: true, isSpecial: false, url: '/app/parametre/langue' },
    { icon: HelpCircle, label: "Obtenir de l'aide", hasArrow: false, isSpecial: false, url: '/app/aide' },
    { icon: Star, label: "Mettre à niveau l'abonnement", hasArrow: false, isSpecial: true, url: '/app/upgrade' },
    { icon: Info, label: 'En savoir plus', hasArrow: true, isSpecial: false, url: '/app/about' },
  ];
  
  // Créer une entreprise par défaut si la liste est vide
  const defaultCompany: Company = {
    id: 'default',
    name: companyName,
    initials: companyName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
    color: '#9333ea',
    notifications: 0
  };
  
  const companiesList = companies.length > 0 ? companies : [defaultCompany];
  const selectedCompany = companiesList.find(c => c.id === selectedCompanyId) || companiesList[0];

  // Initiales utilisateur
  const userInitials = userName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

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

  const handleCompanySelect = (company: Company) => {
    setShowCompanyDropdown(false);
    setSearchTerm('');
    onCompanyChange?.(company.id);
  };

  const handleAddCompany = () => {
    setShowCompanyDropdown(false);
    setSearchTerm('');
    onAddCompany?.();
  };

  const filteredCompanies = companiesList.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {/* Company Header avec Dropdown */}
        <div className="px-1 py-1 border-b border-gray-200 hidden" ref={dropdownRef}>
          {!isCollapsed ? (
            <div className="relative border border-gray-200 rounded-lg shadow-sm" style={{background:"#f0f8ff"}}>
              <button
                onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                className="w-full flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 relative"
                  style={{ background: selectedCompany.color }}
                >
                  {selectedCompany.initials}
                  {(selectedCompany.notifications || 0) > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-sm">
                      {selectedCompany.notifications}
                    </span>
                  )}
                </div>
                
                <div className="flex-1 text-left min-w-0">
                  <h2 className="font-semibold text-gray-800 truncate text-lg">
                    {selectedCompany.name}
                  </h2>
                </div>
                
                {showCompanyDropdown ? (
                  <ChevronsDownUp size={20} className="text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronsUpDown size={20} className="text-gray-700 flex-shrink-0" />
                )}
              </button>

              {showCompanyDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-[100] overflow-hidden">
                  {companiesList.length > 3 && (
                    <div className="p-3 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Rechercher..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          autoFocus
                        />
                      </div>
                    </div>
                  )}

                  {companiesList.length > 1 && (
                    <div className="max-h-64 overflow-y-auto">
                      {filteredCompanies.length > 0 ? (
                        filteredCompanies.map((company) => (
                          <button
                            key={company.id}
                            onClick={() => handleCompanySelect(company)}
                            className={`w-full flex items-center gap-3 p-3 transition-colors ${
                              selectedCompany.id === company.id 
                                ? 'bg-blue-50' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div 
                              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0 relative"
                              style={{ background: company.color }}
                            >
                              {company.initials}
                              {(company.notifications || 0) > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                  {company.notifications}
                                </span>
                              )}
                            </div>
                            
                            <div className="flex-1 text-left min-w-0">
                              <p className="font-medium text-gray-800 truncate text-sm">
                                {company.name}
                              </p>
                            </div>
                            
                            {selectedCompany.id === company.id && (
                              <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500 text-sm">
                          Aucune entreprise trouvée
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`${companiesList.length > 1 ? 'border-t border-gray-100' : ''} p-2`}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddCompany();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter une organisation
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="relative group">
              <button
                onClick={() => setIsCollapsed(false)}
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm mx-auto relative hover:ring-2 hover:ring-offset-2 hover:ring-gray-300 transition-all"
                style={{ background: selectedCompany.color }}
              >
                {selectedCompany.initials}
                {(selectedCompany.notifications || 0) > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {selectedCompany.notifications}
                  </span>
                )}
              </button>
              
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                {selectedCompany.name}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
              </div>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="my-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm items-center gap-2 transition-colors"
        >
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
            {!isCollapsed && (
              <img src="/public/logo.PNG" alt="Logo" className="h-12" />
            )}
            <PanelLeft className="w-6 h-6 cursor-pointer" />
          </div>
        </button>

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-2 space-y-1">
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
                  <NavLink
                    to={item.path}
                    end={item.exact}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative ${
                        isActive
                          ? `${colorClasses.bg} ${colorClasses.text} font-medium`
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      } ${isCollapsed ? 'justify-center' : ''}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && !isCollapsed && (
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${colorClasses.buttonBg} rounded-r-full`}></div>
                        )}
                        
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        
                        {!isCollapsed && <span className="flex-1 font-medium">{item.name}</span>}
                        
                        {hasAddButton && !isCollapsed && (
                          <button
                            className={`p-1 ${colorClasses.buttonBg} ${colorClasses.buttonHover} text-white rounded-md opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95`}
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
                        
                        {isCollapsed && (
                          <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                            {item.name}
                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                          </div>
                        )}
                      </>
                    )}
                  </NavLink>
                </div>
              </div>
            );
          })}
        </nav>

        {/* User Profile Section - TOUJOURS EN BAS */}
        {!isCollapsed ? (
          /* Mode expanded - Profil complet */
          <div className="border-t border-gray-200 relative" ref={userMenuRef}>
            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute bottom-full left-2 right-2 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden animate-slideUp">
                {/* Email Header */}
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="text-gray-600 text-sm truncate">{userEmail}</div>
                </div>

                {/* Menu Items */}
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

                  {/* Divider */}
                  <div className="my-1 border-t border-gray-200"></div>

                  {/* Se déconnecter */}
                  <button 
                    onClick={() => {
                      setShowUserMenu(false);
                      console.log('Déconnexion...');
                    }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 transition-colors text-left text-red-600 group"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Se déconnecter</span>
                  </button>
                </div>
              </div>
            )}

            {/* User Profile Button */}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full px-3 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors rounded-lg"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {userInitials}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-medium text-gray-800 truncate text-sm">{userName}</p>
                <p className="text-gray-500 text-xs truncate">{userPlan}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <button className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors border border-gray-300 relative">
                    <Download className="w-4 h-4 text-gray-600" />
                    {/* Dot animé pour attirer l'attention */}
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                    </span>
                  </button>
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    Passer au plan supérieur
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
                <ChevronsUpDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </div>
            </button>
          </div>
        ) : (
          /* Mode collapsed - Avatar simple */
          <div className="px-3 py-3 border-t border-gray-200">
            <div className="flex flex-col items-center gap-2">
              {/* Bouton Download avec animation */}
              <div className="relative group">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300 relative">
                  <Download className="w-4 h-4 text-gray-600" />
                  {/* Dot animé pour attirer l'attention */}
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                  </span>
                </button>
                {/* Tooltip */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Passer au plan supérieur
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                </div>
              </div>
              
              {/* Avatar */}
              <div className="relative group">
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm hover:ring-2 hover:ring-purple-300 transition-all"
                >
                  {userInitials}
                </button>
                
                {/* Tooltip */}
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
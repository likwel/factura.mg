// apps/frontend/src/components/layout/Header.tsx
import { NavLink } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { 
  FileText, Users, Package, DollarSign, 
  FileStack, Settings, Bell, MessageSquare, 
  Building2, ChevronDown, Check, Plus, Crown
} from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import MessageDropdown from './MessageDropdown';
import NotificationDropdown from './NotificationDropdown';
import CreateOrganizationModal from '../modals/CreateOrganizationModal';
import type { AppMessage, AppNotification } from '../../types/notifications';
import type { ModuleKey } from './AppLayout';

const modules = [
  { 
    id: 'facturation', 
    name: 'Facturation', 
    path: '/app/facturation',
    icon: FileText,
    iconPath: '/invoicing.svg',
    color: 'bg-purple-600',
    cssColor:'#6466fb',
    cssBg:'#6466fb',
    cssBgPrimary :'#4547b3'

  },
  { 
    id: 'partenaires', 
    name: 'Partenaires', 
    path: '/app/partenaires',
    icon: Users,
    iconPath: '/partenaire.svg',
    color: 'bg-blue-600',
    cssColor:'#0ea5e9',
    cssBg:'#0ea5e9',
    cssBgPrimary :'#1074a7'
  },
  { 
    id: 'inventaire', 
    name: 'Inventaire', 
    path: '/app/inventaire',
    icon: Package,
    iconPath: '/vente.svg',
    color: 'bg-green-600',
    cssColor:'#f56b26',
    cssBg:'#f56b26',
    cssBgPrimary :'#b44e1d'
  },
  { 
    id: 'comptabilite', 
    name: 'Comptabilité', 
    path: '/app/comptabilite',
    icon: DollarSign,
    iconPath: '/appoint.svg',
    color: 'bg-orange-600',
    cssColor:'#1ab079',
    cssBg:'#1ab079',
    cssBgPrimary :'#14815a'
  },
  { 
    id: 'documents', 
    name: 'Documents', 
    path: '/app/documents',
    icon: FileStack,
    iconPath: '/menu.svg',
    color: 'bg-teal-600',
    cssColor:'#15b8a6',
    cssBg:'#15b8a6',
    cssBgPrimary :'#108b7e'
  },
  { 
    id: 'parametre', 
    name: 'Paramètre', 
    path: '/app/parametre',
    icon: Settings,
    iconPath: '/invoicing.svg',
    color: 'bg-gray-600',
    cssColor:'#3b82f6',
    cssBg:'#3b82f6',
    cssBgPrimary :'#2969ed'
  },
];

interface HeaderProps {
  activeModule: ModuleKey;
  navColor: string;
  messages?: AppMessage[];
  notifications?: AppNotification[];
}

export default function Header({ 
  activeModule, 
  navColor,
  messages = [],
  notifications = []
}: HeaderProps) {
  const { user, currentCompany, currentMembership, switchCompany, subscription } = useAuth();
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadMessages = messages.filter(m => !m.read).length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Fermer le dropdown en cliquant à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOrgDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
  const currentModule = modules.find(m => m.id === activeModule);

  if (currentModule) {
    document.body.style.setProperty('--main-color', currentModule.cssColor);
    document.body.style.setProperty('--main-bg', currentModule.cssBg);
    document.body.style.setProperty('--main-bg-primary', currentModule.cssBgPrimary);
  }

}, [activeModule]);

  const handleCompanySwitch = async (companyId: string) => {
    if (companyId === currentCompany?.id) {
      setIsOrgDropdownOpen(false);
      return;
    }

    setIsSwitching(true);
    try {
      await switchCompany(companyId);
      setIsOrgDropdownOpen(false);
    } catch (error) {
      console.error('Erreur lors du changement de company:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  const handleCreateOrganization = () => {
    setIsCreateModalOpen(true);
  };

  const handleModalSuccess = () => {
    // Le modal fermera automatiquement et l'utilisateur sera rafraîchi
    console.log('Organisation créée avec succès');
  };

  // Si pas d'utilisateur ou pas de company, ne rien afficher
  if (!user || !currentCompany) {
    return null;
  }

  // Obtenir le badge du plan
  const getPlanBadge = (plan?: string) => {
    if (!plan) return null;
    const colors: Record<string, string> = {
      STARTER: 'bg-blue-100 text-blue-700',
      PROFESSIONAL: 'bg-purple-100 text-purple-700',
      ENTERPRISE: 'bg-orange-100 text-orange-700'
    };
    return colors[plan] || colors.STARTER;
  };

  return (
    <>
      <header className="" style={{ background: navColor, transition: 'background 0.25s ease' }}>
        <div className="flex items-center justify-between px-2 lg:px-2 py-05 gap-4 tabs-custom">
          {/* Navigation Modules */}
          <nav className="flex items-center gap-2 lg:gap-2 flex-1 pt-2 overflow-x-auto scrollbar-hide">
            {modules.map((module) => (
              <NavLink
                key={module.id}
                to={module.path}
                className={({ isActive }) =>
                  `flex font-bold no-underline items-center gap-2 px-3 lg:px-4 py-1.5 rounded-lg  rounded-b-0 transition-all whitespace-nowrap opacity-80 ${
                    isActive
                      ? 'active bg-white shadow-md text-black'
                      : 'hover:bg-white/10 text-white '
                  }`
                }
              >
                <module.icon className="icon w-5 h-5 flex-shrink-0 icon-color" />
                {/* <img src={module.iconPath} alt="" color='red'/> */}
                <span className="hidden md:inline text-sm lg:text-base">{module.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Actions Section */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Messages Dropdown */}
            <MessageDropdown
              messages={messages}
              messageCount={unreadMessages}
              onMessageClick={(id) => console.log('Message clicked:', id)}
              onMarkAsRead={(id) => console.log('Mark as read:', id)}
              onDeleteMessage={(id) => console.log('Delete message:', id)}
            />

            {/* Notifications Dropdown */}
            <NotificationDropdown
              notifications={notifications}
              notificationCount={unreadNotifications}
              onNotificationClick={(id) => console.log('Notification clicked:', id)}
              onMarkAsRead={(id) => console.log('Mark as read:', id)}
              onMarkAllAsRead={() => console.log('Mark all as read')}
              onDeleteNotification={(id) => console.log('Delete notification:', id)}
            />

            {/* Divider */}
            <div className="h-8 w-px bg-white/20"></div>

            {/* Company Switcher Dropdown */}
            <div className="relative company" ref={dropdownRef}>
              <button 
                onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
                className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl backdrop-blur-sm transition-all group"
                disabled={isSwitching}
              >
                {currentCompany.logo ? (
                  <img 
                    src={currentCompany.logo} 
                    alt={currentCompany.name}
                    className="w-5 h-5 rounded object-cover"
                  />
                ) : (
                  <Building2 className="w-5 h-5 text-white" />
                )}
                <span className="hidden sm:inline text-sm font-medium text-white max-w-[120px] lg:max-w-[200px] truncate">
                  {currentCompany.name}
                </span>
                <ChevronDown className={`w-4 h-4 text-white transition-transform ${isOrgDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isOrgDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                  {/* Current Company Info */}
                  {subscription && (
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-600">Plan actuel</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPlanBadge(subscription.plan)}`}>
                          {subscription.plan}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {subscription.isOwner 
                          ? "Vous gérez ce plan"
                          : `Géré par ${subscription.ownerName}`
                        }
                      </p>
                    </div>
                  )}

                  {/* Company List */}
                  <div className="max-h-64 overflow-y-auto">
                    {user.companyMemberships.map((membership) => {
                      const isOwner = membership.company.ownerId === user.id;
                      const isActive = membership.companyId === currentCompany.id;

                      return (
                        <button
                          key={membership.companyId}
                          onClick={() => handleCompanySwitch(membership.companyId)}
                          disabled={isSwitching}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {membership.company.logo ? (
                                <img 
                                  src={membership.company.logo} 
                                  alt={membership.company.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Building2 className="w-5 h-5 text-gray-600" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-700 truncate group-hover:text-gray-900">
                                  {membership.company.name}
                                </p>
                                {isOwner && (
                                  <Crown className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-gray-500 capitalize">
                                  {membership.role.toLowerCase()}
                                </p>
                                {membership.position && (
                                  <>
                                    <span className="text-xs text-gray-400">•</span>
                                    <p className="text-xs text-gray-500">
                                      {membership.position}
                                    </p>
                                  </>
                                )}
                                {isOwner && membership.company.owner.currentPlan && (
                                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${getPlanBadge(membership.company.owner.currentPlan)}`}>
                                    {membership.company.owner.currentPlan}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {isActive && (
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Divider */}
                  {user.companyMemberships.length > 0 && (
                    <div className="border-t border-gray-200"></div>
                  )}

                  {/* Add Organization Button */}
                  <button
                    onClick={handleCreateOrganization}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Plus className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-blue-600">
                      Créer une organisation
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modal de création d'organisation */}
      <CreateOrganizationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </>
  );
}
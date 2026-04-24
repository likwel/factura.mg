// apps/frontend/src/components/layout/Header.tsx
import { NavLink } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { 
  FileText, Users, Package, DollarSign, 
  FileStack, Settings, Bell, MessageSquare, 
  Building2, ChevronDown, Check, Plus
} from 'lucide-react';

import type { ModuleKey } from './AppLayout';
import MessageDropdown from './MessageDropdown';
import NotificationDropdown from './NotificationDropdown';
import type { AppMessage, AppNotification } from '../../types/notifications';

const modules = [
  { 
    id: 'facturation', 
    name: 'Facturation', 
    path: '/app/facturation',
    icon: FileText,
    color: 'bg-purple-600'
  },
  { 
    id: 'partenaires', 
    name: 'Partenaires', 
    path: '/app/partenaires',
    icon: Users,
    color: 'bg-blue-600'
  },
  { 
    id: 'inventaire', 
    name: 'Inventaire', 
    path: '/app/inventaire',
    icon: Package,
    color: 'bg-green-600'
  },
  { 
    id: 'comptabilite', 
    name: 'Comptabilité', 
    path: '/app/comptabilite',
    icon: DollarSign,
    color: 'bg-orange-600'
  },
  { 
    id: 'documents', 
    name: 'Documents', 
    path: '/app/documents',
    icon: FileStack,
    color: 'bg-teal-600'
  },
  { 
    id: 'parametre', 
    name: 'Paramètre', 
    path: '/app/parametre',
    icon: Settings,
    color: 'bg-gray-600'
  },
];

interface Organization {
  id: string;
  name: string;
}

interface HeaderProps {
  activeModule: ModuleKey;
  navColor: string;
  currentOrganization: Organization;
  organizations?: Organization[];
  messages?: AppMessage[];
  notifications?: AppNotification[];
  onOrganizationChange?: (orgId: string) => void;
  onCreateOrganization?: () => void;
}

export default function Header({ 
  activeModule, 
  navColor,
  currentOrganization,
  organizations = [],
  messages = [],
  notifications = [],
  onOrganizationChange,
  onCreateOrganization
}: HeaderProps) {
  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);
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

  const handleOrganizationSelect = (orgId: string) => {
    onOrganizationChange?.(orgId);
    setIsOrgDropdownOpen(false);
  };

  return (
    <header className="shadow-lg" style={{ background: navColor, transition: 'background 0.25s ease' }}>
      <div className="flex items-center justify-between px-4 lg:px-6 py-2 gap-4">
        {/* Navigation Modules */}
        <nav className="flex items-center gap-1 lg:gap-2 flex-1 overflow-x-auto scrollbar-hide">
          {modules.map((module) => (
            <NavLink
              key={module.id}
              to={module.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg text-white transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white/20 font-semibold shadow-md'
                    : 'hover:bg-white/10'
                }`
              }
            >
              <module.icon className="w-5 h-5 flex-shrink-0" />
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

          {/* Organization Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg backdrop-blur-sm transition-all group"
            >
              <Building2 className="w-5 h-5 text-white" />
              <span className="hidden sm:inline text-sm font-medium text-white max-w-[120px] lg:max-w-[200px] truncate">
                {currentOrganization.name}
              </span>
              <ChevronDown className={`w-4 h-4 text-white transition-transform ${isOrgDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOrgDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
                {/* Organization List */}
                <div className="max-h-64 overflow-y-auto">
                  {organizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => handleOrganizationSelect(org.id)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 truncate group-hover:text-gray-900">
                          {org.name}
                        </span>
                      </div>
                      {org.id === currentOrganization.id && (
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Divider */}
                {organizations.length > 0 && (
                  <div className="border-t border-gray-200"></div>
                )}

                {/* Add Organization Button */}
                <button
                  onClick={() => {
                    onCreateOrganization?.();
                    setIsOrgDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
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
  );
}
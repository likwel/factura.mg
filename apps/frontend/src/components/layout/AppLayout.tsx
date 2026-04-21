// apps/frontend/src/components/layout/AppLayout.tsx
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import ModuleSidebar from './ModuleSidebar';
import NotificationBanner from '../common/NotificationBanner';

export type ModuleKey = 'facturation' | 'partenaires' | 'inventaire' | 'comptabilite' | 'documents' | 'parametre';

const moduleThemes: Record<ModuleKey, { primary: string; secondary: string; navColor: string }> = {
  facturation:  { primary: '#7e22ce', secondary: '#a855f7', navColor: '#534AB7' },
  partenaires:  { primary: '#2563eb', secondary: '#3b82f6', navColor: '#185FA5' },
  inventaire:   { primary: '#16a34a', secondary: '#22c55e', navColor: '#de7045' },
  comptabilite: { primary: '#0d9488', secondary: '#14b8a6', navColor: '#0F6E56' },
  documents:    { primary: '#2563eb', secondary: '#3b82f6', navColor: '#185FA5' },
  parametre:    { primary: '#4b5563', secondary: '#6b7280', navColor: '#5F5E5A' },
};

const getActiveModule = (pathname: string): ModuleKey => {
  const segments: ModuleKey[] = ['facturation', 'partenaires', 'inventaire', 'comptabilite', 'documents', 'parametre'];
  return segments.find(s => pathname.includes(`/${s}`)) ?? 'facturation';
};

export default function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();

  const activeModule = getActiveModule(location.pathname);
  const currentTheme = moduleThemes[activeModule];

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', currentTheme.primary);
    document.documentElement.style.setProperty('--color-secondary', currentTheme.secondary);
  }, [currentTheme]);

interface Company {
  id: string;
  name: string;
  initials: string;
  color: string;
  notifications?: number;
}

// Créer des objets Company
const companies: Company[] = [
  { 
    id: '1',
    name: 'Profil', 
    initials: 'PR',
    color: '#3B82F6',
    notifications: 3
  },
  { 
    id: '2',
    name: 'Entreprise', 
    initials: 'EN',
    color: '#10B981'
  },
  { 
    id: '3',
    name: 'Utilisateurs', 
    initials: 'UT',
    color: '#F59E0B',
    notifications: 12
  },
  { 
    id: '4',
    name: 'Paramètres', 
    initials: 'PA',
    color: '#8B5CF6'
  },
];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeModule={activeModule} navColor={currentTheme.navColor} />

      <div className="flex h-[calc(100vh-64px)]">
        <ModuleSidebar
          companyName={user?.company?.name || 'Mon Entreprise'}
          moduleId={activeModule}
          companies={companies}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <NotificationBanner
              message="Vous utilisez actuellement la version d'essai"
              expiryDate="19-04-2026"
              type="warning"
              actionLabel="Activer"
              onAction={() => console.log('Activate subscription')}
            />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
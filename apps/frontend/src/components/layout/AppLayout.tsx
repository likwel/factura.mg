// apps/frontend/src/components/layout/AppLayout.tsx
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import ModuleSidebar from './ModuleSidebar';
import NotificationBanner from '../common/NotificationBanner';
import type { AppMessage, AppNotification } from '../../types/notifications';

import { moduleThemes } from '../shared/moduleThemes';

export type ModuleKey = 'facturation' | 'partenaires' | 'inventaire' | 'comptabilite' | 'documents' | 'parametre'| 'messages' | 'notifications';

// const moduleThemes: Record<ModuleKey, { primary: string; secondary: string; navColor: string }> = {
//   facturation:  { primary: '#7e22ce', secondary: '#a855f7', navColor: '#534AB7' },
//   partenaires:  { primary: '#2563eb', secondary: '#3b82f6', navColor: '#185FA5' },
//   inventaire:   { primary: '#16a34a', secondary: '#22c55e', navColor: '#de7045' },
//   comptabilite: { primary: '#0d9488', secondary: '#14b8a6', navColor: '#0F6E56' },
//   documents:    { primary: '#2563eb', secondary: '#3b82f6', navColor: '#185FA5' },
//   parametre:    { primary: '#4b5563', secondary: '#6b7280', navColor: '#5F5E5A' },
// };

const getActiveModule = (pathname: string): ModuleKey => {
  const segments: ModuleKey[] = ['facturation', 'partenaires', 'inventaire', 'comptabilite', 'documents', 'parametre', 'messages', 'notifications'];
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

const sampleMessages: AppMessage[] = [
  {
    id: '1',
    sender: 'Jean Dupont',
    subject: 'Nouvelle commande #1234',
    preview: 'Une nouvelle commande vient d\'être passée...',
    timestamp: 'Il y a 5 min',
    read: false,
    important: true
  },
  {
    id: '2',
    sender: 'Marie Martin',
    subject: 'Facture en attente',
    preview: 'La facture #5678 nécessite votre attention...',
    timestamp: 'Il y a 2h',
    read: false
  },
  {
    id: '3',
    sender: 'Pierre Durand',
    subject: 'Réunion confirmée',
    preview: 'La réunion de demain est confirmée à 14h...',
    timestamp: 'Hier',
    read: true
  }
];

const sampleNotifications: AppNotification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Paiement reçu',
    message: 'Un paiement de 1 500€ a été reçu pour la facture #1234',
    timestamp: 'Il y a 10 min',
    read: false
  },
  {
    id: '2',
    type: 'warning',
    title: 'Stock faible',
    message: 'Le stock de "Produit A" est inférieur à 10 unités',
    timestamp: 'Il y a 1h',
    read: false
  },
  {
    id: '3',
    type: 'info',
    title: 'Nouveau devis',
    message: 'Un nouveau devis a été créé par Marie Martin',
    timestamp: 'Il y a 3h',
    read: true
  },
  {
    id: '4',
    type: 'error',
    title: 'Erreur de synchronisation',
    message: 'La synchronisation avec le système comptable a échoué',
    timestamp: 'Hier',
    read: false
  }
];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Header activeModule={activeModule} navColor={currentTheme.navColor} /> */}

      <Header
        activeModule={activeModule}
        navColor={currentTheme.navColor}
        currentOrganization={{ id: '1', name: 'Mon Entreprise' }}
        organizations={[
          { id: '1', name: 'Mon Entreprise' },
          { id: '2', name: 'Filiale Paris' },
          { id: '3', name: 'Agence Lyon' },
        ]}
        messages={sampleMessages}
        notifications={sampleNotifications}
        onOrganizationChange={(orgId) => console.log('Switch to org:', orgId)}
        onCreateOrganization={() => console.log('Create new organization')}
      />

      <div className="flex h-[calc(100vh-64px)]">
        <ModuleSidebar
          companyName={user?.company?.name || 'Mon Entreprise'}
          moduleId={activeModule}
          companies={companies}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* <NotificationBanner
              message="Vous utilisez actuellement la version d'essai"
              expiryDate="19-04-2026"
              type="warning"
              actionLabel="Activer"
              onAction={() => console.log('Activate subscription')}
            /> */}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
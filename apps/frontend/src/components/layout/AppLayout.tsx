// apps/frontend/src/components/layout/AppLayout.tsx
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import ModuleSidebar from './ModuleSidebar';
import NotificationBanner from '../common/NotificationBanner';
import type { AppMessage, AppNotification } from '../../types/notifications';

import { moduleThemes } from '../shared/moduleThemes';

export type ModuleKey = 'facturation' | 'partenaires' | 'inventaire' | 'comptabilite' | 'documents' | 'parametre' | 'messages' | 'notifications';

const getActiveModule = (pathname: string): ModuleKey => {
  const segments: ModuleKey[] = ['facturation', 'partenaires', 'inventaire', 'comptabilite', 'documents', 'parametre', 'messages', 'notifications'];
  return segments.find(s => pathname.includes(`/${s}`)) ?? 'facturation';
};

// Données de test - À remplacer par de vraies données de votre API
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

export default function AppLayout() {
  const { user, currentCompany, isLoading } = useAuth();
  const location = useLocation();

  const activeModule = getActiveModule(location.pathname);
  const currentTheme = moduleThemes[activeModule];

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary', currentTheme.primary);
    document.documentElement.style.setProperty('--color-secondary', currentTheme.secondary);
  }, [currentTheme]);

  // Afficher un loader pendant le chargement de l'authentification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si pas d'utilisateur connecté, ne rien afficher (sera géré par ProtectedRoute)
  if (!user || !currentCompany) {
    return null;
  }

  // Convertir les companies de l'utilisateur pour le ModuleSidebar
  const sidebarCompanies = user.companyMemberships.map((company, index) => ({
    id: company.id,
    name: company.company.name,
    initials: company.company.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2),
    color: company.company.logo || ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'][index % 5],
    notifications: 0 // À remplacer par de vraies données
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        activeModule={activeModule}
        navColor={currentTheme.navColor}
        messages={sampleMessages}
        notifications={sampleNotifications}
        // onCreateOrganization={() => console.log('Create new organization')}
      />

      <div className="flex h-[calc(100vh-64px)]">
        <ModuleSidebar
          // companyName={currentCompany.name}
          moduleId={activeModule}
          // companies={sidebarCompanies}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-3">
            {/* Notification Banner - Optionnel */}
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
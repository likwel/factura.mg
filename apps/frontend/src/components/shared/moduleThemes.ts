// apps/frontend/src/config/moduleThemes.ts
export type ModuleKey = 'facturation' | 'partenaires' | 'inventaire' | 'comptabilite' | 'documents' | 'parametre' | 'messages' | 'notifications';

export interface ModuleTheme {
  primary: string;
  secondary: string;
  navColor: string;
  color: string; // Pour la compatibilité avec StatCard
}

export const moduleThemes: Record<ModuleKey, ModuleTheme> = {
  facturation: { 
    primary: '#7e22ce', 
    secondary: '#a855f7', 
    navColor: '#534AB7',
    color: 'purple'
  },
  partenaires: { 
    primary: '#2563eb', 
    secondary: '#3b82f6', 
    navColor: '#185FA5',
    color: 'blue'
  },
  inventaire: { 
    primary: '#ea580c', 
    secondary: '#fb923c', 
    navColor: '#de7045',
    color: 'orange'
  },
  comptabilite: { 
    primary: '#0d9488', 
    secondary: '#14b8a6', 
    navColor: '#0F6E56',
    color: 'teal'
  },
  documents: { 
    primary: '#2563eb', 
    secondary: '#3b82f6', 
    navColor: '#185FA5',
    color: 'blue'
  },
  // Nouveau : Messages
  messages: {
    primary: '#3b82f6',
    secondary: '#60a5fa',
    navColor: '#2563eb',
    color: 'blue'
  },
  // Nouveau : Notifications
  notifications: {
    primary: '#ef4444',
    secondary: '#f87171',
    navColor: '#dc2626',
    color: 'red'
  },
  parametre: { 
    primary: '#4b5563', 
    secondary: '#6b7280', 
    navColor: '#5F5E5A',
    color: 'gray'
  },
};

// Helper pour obtenir juste la couleur (pour compatibilité)
export const getModuleColor = (module: ModuleKey): string => {
  return moduleThemes[module].color;
};
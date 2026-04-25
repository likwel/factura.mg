// apps/frontend/src/config/moduleThemes.ts
export type ModuleKey = 
  | 'facturation' 
  | 'partenaires' 
  | 'inventaire' 
  | 'comptabilite' 
  | 'documents' 
  | 'messages'
  | 'notifications'
  | 'parametre';

export interface ModuleTheme {
  primary: string;
  secondary: string;
  navColor: string;
  color: string;
}

export const moduleThemes: Record<ModuleKey, ModuleTheme> = {
  // Facturation - Primary-2 (Violet)
  facturation: { 
    primary: '#7e22ce',    // primary-2
    secondary: '#a855f7',  // Nuance plus claire
    navColor: '#6d1fb3',   // Nuance plus foncée
    color: 'purple'
  },
  
  // Partenaires - Info-2 (Bleu)
  partenaires: { 
    primary: '#3b82f6',    // info-2
    secondary: '#60a5fa',  // Nuance plus claire
    navColor: '#2563eb',   // Nuance plus foncée
    color: 'blue'
  },
  
  // Inventaire - Warning (Orange)
  inventaire: { 
    primary: '#f56b26',    // warning
    secondary: '#fb923c',  // Nuance plus claire
    navColor: '#ea580c',   // Nuance plus foncée
    color: 'orange'
  },
  
  // Comptabilité - Success-2 (Teal)
  comptabilite: { 
    primary: '#15b8a6',    // success-2
    secondary: '#2dd4bf',  // Nuance plus claire
    navColor: '#0d9488',   // Nuance plus foncée
    color: 'teal'
  },
  
  // Documents - Info (Bleu cyan)
  documents: { 
    primary: '#0ea5e9',    // info
    secondary: '#38bdf8',  // Nuance plus claire
    navColor: '#0284c7',   // Nuance plus foncée
    color: 'blue'
  },
  
  // Messages - Primary (Bleu-violet)
  messages: {
    primary: '#6466fb',    // primary
    secondary: '#818cf8',  // Nuance plus claire
    navColor: '#4f46e5',   // Nuance plus foncée
    color: 'blue'
  },
  
  // Notifications - Success (Vert)
  notifications: {
    primary: '#1ab079',    // success
    secondary: '#34d399',  // Nuance plus claire
    navColor: '#059669',   // Nuance plus foncée
    color: 'green'
  },
  
  // Paramètres - Gray (Gris neutre)
  parametre: { 
    primary: '#6b7280',    // gray-500
    secondary: '#9ca3af',  // gray-400
    navColor: '#4b5563',   // gray-600
    color: 'gray'
  },
};

export const getModuleColor = (module: ModuleKey): string => {
  return moduleThemes[module].color;
};

// Export des couleurs CSS pour utilisation directe
export const cssColors = {
  primary: '#6466fb',
  info: '#0ea5e9',
  success: '#1ab079',
  warning: '#f56b26',
  success2: '#15b8a6',
  info2: '#3b82f6',
  primary2: '#7e22ce',
} as const;
// apps/frontend/src/components/layout/Header.tsx
import { NavLink } from 'react-router-dom';
import { 
  FileText, Users, Package, DollarSign, 
  FileStack, Settings, Bell, User 
} from 'lucide-react';

import type { ModuleKey } from './AppLayout';

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

interface HeaderProps {
  activeModule: ModuleKey;
  navColor: string;
}

export default function Header({ activeModule, navColor }: HeaderProps) {
  return (
    <header className="shadow-lg" style= {{ background: navColor, transition: 'background 0.25s ease' }}>
      <div className="flex items-center justify-between px-6 py-3">
        {/* Navigation Modules */}
        <nav className="flex items-center gap-2">
          {modules.map((module) => (
            <NavLink
              key={module.id}
              to={module.path}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all ${
                  isActive
                    ? 'bg-white/20 font-semibold shadow-md'
                    : 'hover:bg-white/10'
                }`
              }
            >
              <module.icon className="w-5 h-5" />
              <span className="hidden md:inline">{module.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-white hover:bg-white/10 rounded-lg">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="flex items-center gap-2 p-2 text-white hover:bg-white/10 rounded-lg">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
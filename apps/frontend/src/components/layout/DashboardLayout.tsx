import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Users, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardLayout() {
  const { logout, user } = useAuth();

  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/articles', icon: Package, label: 'Articles' },
    { to: '/clients', icon: Users, label: 'Clients' },
    { to: '/invoices', icon: FileText, label: 'Factures' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary-600">Factura.mg</h1>
        </div>
        
        <nav className="p-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg ${
                  isActive ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 hover:bg-gray-50 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-6 py-4">
          <h2 className="text-xl font-semibold">
            Bienvenue, {user?.firstName} {user?.lastName}
          </h2>
        </header>
        
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

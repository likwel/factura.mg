// apps/frontend/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Pages publiques
import LandingPage from './pages/landing/LandingPage';
import LandingPageEn from './pages/landing/LandingPageEn';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Layout
import AppLayout from './components/layout/AppLayout';
import PrivateRoute from './components/common/PrivateRoute';

// Pages Facturation
import FacturationDashboard from './pages/modules/FacturationDashboard';

// Pages Partenaires
import PartenairesDashboard from './pages/modules/PartenairesDashboard';

// Pages Inventaire
import InventaireDashboard from './pages/modules/InventaireDashboard';

// Pages Comptabilité
import ComptabiliteDashboard from './pages/modules/ComptabiliteDashboard';

// Pages Documents
import DocumentsDashboard from './pages/modules/DocumentsDashboard';

// Pages Paramètre
import ParametreDashboard from './pages/modules/ParametreDashboard';
import InvoicesPage from './pages/InvoicesPage';
import ArticlesPage from './pages/ArticlesPage';
import ArticleForm from './pages/form/ArticleForm';
import PartnerForm from './pages/form/PartnerForm';
import MessagesDashboard from './pages/modules/MessagesDashboard';
import NotificationsDashboard from './pages/modules/NotificationsDashboard';
import PartenairePage from './pages/PartenairePage';


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster position="top-right" />
          <Routes>
            {/* Pages publiques */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/en" element={<LandingPageEn />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Application protégée */}
            <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
              
              {/* Redirections */}
              <Route path="/dashboard" element={<Navigate to="/app/facturation" replace />} />
              <Route path="/app" element={<Navigate to="/app/facturation" replace />} />
              
              <Route path="/app/messages" element={<MessagesDashboard />} />
              <Route path="/app/notifications" element={<NotificationsDashboard />} />

              <Route path="/app/article" element={<ArticlesPage />} />
              <Route path="/app/article/new" element={<ArticleForm />} />
              {/* MODULE FACTURATION - VIOLET */}
              <Route path="/app/facturation" element={<FacturationDashboard />} />
              <Route path="/app/facturation/devis" element={<div className="p-6">Page Devis (à créer)</div>} />
              <Route path="/app/facturation/recurrentes" element={<div className="p-6">Page Recurrents (à créer)</div>} />
              <Route path="/app/facturation/factures" element={<InvoicesPage />} />
              <Route path="/app/facturation/articles" element={<ArticlesPage />} />
              <Route path="/app/facturation/articles/new" element={<ArticleForm />} />
              <Route path="/app/facturation/achats" element={<div className="p-6">Page Achats (à créer)</div>} />
              <Route path="/app/facturation/frais" element={<div className="p-6">Page Frais (à créer)</div>} />
              
              {/* MODULE PARTENAIRES - BLEU */}
              <Route path="/app/partenaires" element={<PartenairesDashboard />} />
              <Route path="/app/partenaires/new" element={<PartnerForm />} />
              {/* <Route path="/app/partenaires/clients" element={<PartenairesDashboard />} /> */}
              <Route path="/app/partenaires/clients" element={<PartenairePage type="client"/>} />
              <Route path="/app/partenaires/fournisseurs" element={<PartenairePage type="fournisseur"/>} />
              
              {/* MODULE INVENTAIRE - ORANGE */}
              <Route path="/app/inventaire" element={<div className="p-6"><h1 className="text-2xl font-bold">Dashboard Inventaire</h1></div>} />
              <Route path="/app/inventaire/stock" element={<InventaireDashboard />} />
              <Route path="/app/inventaire/emplacements" element={<div className="p-6">Page Emplacements (à créer)</div>} />
              <Route path="/app/inventaire/inventaire" element={<div className="p-6">Page Inventaire (à créer)</div>} />
              <Route path="/app/inventaire/ajustement" element={<div className="p-6">Page Ajustement (à créer)</div>} />
              <Route path="/app/inventaire/transfert" element={<div className="p-6">Page Transfert (à créer)</div>} />
              <Route path="/app/inventaire/documents" element={<div className="p-6">Page Documents (à créer)</div>} />
              
              {/* MODULE COMPTABILITÉ - TEAL */}
              <Route path="/app/comptabilite" element={<div className="p-6"><h1 className="text-2xl font-bold">Dashboard Comptabilité</h1></div>} />
              <Route path="/app/comptabilite/ventes" element={<ComptabiliteDashboard />} />
              <Route path="/app/comptabilite/journaux" element={<div className="p-6">Page Journaux (à créer)</div>} />
              <Route path="/app/comptabilite/ecritures" element={<div className="p-6">Page Écritures (à créer)</div>} />
              <Route path="/app/comptabilite/plan" element={<div className="p-6">Page Plan comptable (à créer)</div>} />
              <Route path="/app/comptabilite/etats" element={<div className="p-6">Page États (à créer)</div>} />
              <Route path="/app/comptabilite/tresorerie" element={<div className="p-6">Page Trésorerie (à créer)</div>} />
              <Route path="/app/comptabilite/parametres" element={<div className="p-6">Page Paramètres (à créer)</div>} />
              
              {/* MODULE DOCUMENTS - BLEU CLAIR */}
              <Route path="/app/documents" element={<div className="p-6"><h1 className="text-2xl font-bold">Dashboard Documents</h1></div>} />
              <Route path="/app/documents/factures" element={<DocumentsDashboard />} />
              <Route path="/app/documents/devis" element={<div className="p-6">Page Devis (à créer)</div>} />
              <Route path="/app/documents/commandes" element={<div className="p-6">Page Commandes (à créer)</div>} />
              <Route path="/app/documents/livraison" element={<div className="p-6">Page Livraison (à créer)</div>} />
              <Route path="/app/documents/avoirs" element={<div className="p-6">Page Avoirs (à créer)</div>} />
              <Route path="/app/documents/expedition" element={<div className="p-6">Page Expédition (à créer)</div>} />
              
              {/* MODULE PARAMÈTRE - GRIS */}
              <Route path="/app/parametre" element={<ParametreDashboard id='profil' />} />
              <Route path="/app/parametre/profil" element={<ParametreDashboard id='profil' />} />
              <Route path="/app/parametre/entreprise" element={<ParametreDashboard id='entreprise' />} />
              <Route path="/app/parametre/utilisateurs" element={<ParametreDashboard id='utilisateurs' />} />
              <Route path="/app/parametre/securite" element={<ParametreDashboard id='securite' />} />
              <Route path="/app/parametre/permissions" element={<ParametreDashboard id='permissions' />} />
              <Route path="/app/parametre/abonnement" element={<ParametreDashboard id='abonnement' />} />
              <Route path="/app/parametre/theme" element={<ParametreDashboard id='theme' />} />
              <Route path="/app/parametre/notifications" element={<ParametreDashboard id='notifications' />} />
              
            </Route>

            {/* 404 - Page non trouvée */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">Page non trouvée</p>
                  <a href="/" className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Retour à l'accueil
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
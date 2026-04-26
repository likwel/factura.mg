import { Home, ArrowLeft, Search, Package, FileText, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  const popularLinks = [
    { icon: <Package className="w-4 h-4" />, label: 'Articles', path: '/app/facturation/articles' },
    { icon: <FileText className="w-4 h-4" />, label: 'Factures', path: '/app/facturation/invoices' },
    { icon: <Users className="w-4 h-4" />, label: 'Clients', path: '/app/clients' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Illustration 404 */}
        <div className="mb-8 relative">
          {/* Cercles décoratifs en arrière-plan */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 bg-purple-200/30 rounded-full blur-3xl animate-pulse"></div>
          </div>
          
          {/* Numéro 404 stylisé */}
          <div className="relative">
            <h1 className="text-9xl md:text-[12rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 leading-none mb-2 animate-in fade-in zoom-in duration-500">
              404
            </h1>
            
            {/* Icône de recherche au centre du 0 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-in fade-in duration-700 delay-300">
              <div className="bg-white rounded-full p-6 shadow-xl">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="mb-8 animate-in slide-in-from-bottom duration-500 delay-100">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Oups ! Page introuvable
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <p className="text-sm text-gray-500">
            Vérifiez l'URL ou retournez à l'accueil.
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-in slide-in-from-bottom duration-500 delay-200">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 font-medium"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 bg-white text-gray-700 border-2 border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Page précédente
          </button>
        </div>

        {/* Liens populaires */}
        <div className="animate-in slide-in-from-bottom duration-500 delay-300">
          <p className="text-sm text-gray-500 mb-4">Ou explorez ces pages :</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {popularLinks.map((link, index) => (
              <button
                key={index}
                onClick={() => navigate(link.path)}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-purple-50 hover:text-purple-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2 text-sm border border-gray-200"
              >
                {link.icon}
                {link.label}
              </button>
            ))}
          </div>
        </div>

        {/* Code d'erreur subtil */}
        <div className="mt-12 text-xs text-gray-400 animate-in fade-in duration-500 delay-500">
          Code erreur : 404 • Page Not Found
        </div>
      </div>
    </div>
  );
};

// Route dans votre App.tsx
// <Route path="*" element={<NotFoundPage />} />

export default NotFoundPage;
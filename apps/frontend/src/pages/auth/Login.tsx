import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      toast.success('Connexion réussie ! Bienvenue 👋');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      
      let errorMessage = 'Erreur de connexion';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <img 
            src="/public/logo.PNG" 
            alt="Logo" 
            className="h-12 mb-4 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={() => navigate('/')}
          />
          {/* <h1 className="text-2xl font-bold text-gray-900 mb-1">Connexion</h1> */}
          <p className="text-gray-600 text-sm">Connectez-vous à votre compte</p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
              placeholder="votre.email@exemple.com"
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {/* Mot de passe avec toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                placeholder="••••••••"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={loading}
              >
                {showPassword ? (
                  // Icône œil fermé (masquer)
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  // Icône œil ouvert (afficher)
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Bouton Submit */}
          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Connexion...
              </span>
            ) : (
              'Se connecter'
            )}
          </button>
        </div>

        {/* Lien vers Register */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Pas encore de compte ?{' '}
            <Link 
              to="/register" 
              className="text-primary-600 hover:text-primary-700 hover:underline font-medium transition-colors"
            >
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
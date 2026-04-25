import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Company {
  id: string;
  name: string;
  memberCount?: number;
  logo?: string;
}

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    companyName: '',
    companyId: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isCreatingCompany, setIsCreatingCompany] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  // ── Recherche de companies avec debounce ──────────────────────
  useEffect(() => {
    if (!isCreatingCompany && searchTerm.length >= 2) {
      const delayDebounce = setTimeout(() => {
        searchCompanies();
      }, 300);
      return () => clearTimeout(delayDebounce);
    } else {
      setCompanies([]);
      setShowResults(false);
    }
  }, [searchTerm, isCreatingCompany]);

  const searchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const response = await api.get(`/companies/search?q=${encodeURIComponent(searchTerm)}`);
      setCompanies(response.data || []);
      setShowResults(true);
    } catch (error) {
      console.error('Erreur recherche entreprises:', error);
      setCompanies([]);
      toast.error('Erreur lors de la recherche d\'entreprises');
    } finally {
      setLoadingCompanies(false);
    }
  };

  // ── Soumission du formulaire ──────────────────────────────────
  const handleSubmit = async () => {
    setError('');

    // Validation du mot de passe
    if (formData.password !== formData.confirmPassword) {
      const msg = 'Les mots de passe ne correspondent pas';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (formData.password.length < 6) {
      const msg = 'Le mot de passe doit contenir au moins 6 caractères';
      setError(msg);
      toast.error(msg);
      return;
    }

    // Validation de la company
    if (!isCreatingCompany && !formData.companyId) {
      const msg = 'Veuillez sélectionner une entreprise';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (isCreatingCompany && !formData.companyName.trim()) {
      const msg = 'Veuillez entrer le nom de votre entreprise';
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    
    try {
      // Préparer les données selon le mode
      const registerData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        ...(isCreatingCompany 
          ? { companyName: formData.companyName.trim() } 
          : { companyId: formData.companyId }
        )
      };

      // Inscription
      await api.post('/auth/register', registerData);
      
      // Connexion automatique
      await login(formData.email, formData.password);
      
      toast.success('Inscription réussie ! Bienvenue 🎉');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      
      let errorMessage = 'Erreur d\'inscription';
      
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

  // ── Gestion des changements de champs ─────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── Sélection d'une company ───────────────────────────────────
  const selectCompany = (company: Company) => {
    setFormData({ 
      ...formData, 
      companyId: company.id, 
      companyName: company.name 
    });
    setSearchTerm(company.name);
    setShowResults(false);
    toast.success(`Entreprise "${company.name}" sélectionnée`);
  };

  // ── Changer de mode (Créer/Rejoindre) ─────────────────────────
  const toggleMode = (createMode: boolean) => {
    setIsCreatingCompany(createMode);
    setFormData({ 
      ...formData, 
      companyId: '', 
      companyName: createMode ? formData.companyName : '' 
    });
    setSearchTerm('');
    setShowResults(false);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 py-12 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div 
          className="flex flex-col items-center text-center mb-6 cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => navigate('/')}
        >
          <img src="/public/logo.PNG" alt="Logo" className="h-12 mb-3" />
          {/* <h1 className="text-2xl font-bold text-gray-900 mb-1">Créer votre compte</h1> */}
          <p className="text-gray-600 text-sm">Créer votre compte en quelques étapes</p>
        </div>

        {/* Message d'erreur global */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Prénom et Nom */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                placeholder="Jean"
                disabled={loading}
                autoComplete="given-name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                placeholder="Dupont"
                disabled={loading}
                autoComplete="family-name"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
              placeholder="jean.dupont@exemple.com"
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
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                placeholder="••••••••"
                minLength={6}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={loading}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
          </div>

          {/* Confirmation mot de passe avec toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                placeholder="••••••••"
                minLength={6}
                disabled={loading}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Les mots de passe ne correspondent pas
              </p>
            )}
            {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Les mots de passe correspondent
              </p>
            )}
          </div>

          {/* Section Entreprise */}
          <div className="border-t border-gray-200 pt-5 mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Entreprise <span className="text-red-500">*</span>
            </label>
            
            {/* Toggle Créer/Rejoindre */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => toggleMode(true)}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                  isCreatingCompany
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={loading}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Créer nouvelle
                </span>
              </button>
              <button
                type="button"
                onClick={() => toggleMode(false)}
                className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                  !isCreatingCompany
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={loading}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Rejoindre
                </span>
              </button>
            </div>

            {/* Mode: Créer nouvelle entreprise */}
            {isCreatingCompany ? (
              <div>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Nom de votre entreprise"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                  disabled={loading}
                  autoComplete="organization"
                />
                <p className="text-xs text-gray-500 mt-2">
                  💼 Vous serez automatiquement administrateur de cette entreprise
                </p>
              </div>
            ) : (
              /* Mode: Rejoindre entreprise existante */
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if (!e.target.value) {
                        setFormData({ ...formData, companyId: '', companyName: '' });
                      }
                    }}
                    placeholder="Rechercher une entreprise..."
                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                    disabled={loading || !!formData.companyId}
                    autoComplete="off"
                  />
                  <svg 
                    className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                {/* Loader pendant la recherche */}
                {loadingCompanies && (
                  <div className="mt-2 text-center py-2">
                    <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Recherche en cours...
                    </p>
                  </div>
                )}

                {/* Liste des résultats */}
                {showResults && !loadingCompanies && companies.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {companies.map((company) => (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() => selectCompany(company)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b last:border-b-0 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          {company.logo ? (
                            <img src={company.logo} alt={company.name} className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-600 font-bold text-lg">
                                {company.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                              {company.name}
                            </p>
                            {company.memberCount !== undefined && (
                              <p className="text-xs text-gray-500">
                                {company.memberCount} membre{company.memberCount > 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}

                {/* Entreprise sélectionnée */}
                {formData.companyId && (
                  <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-900">{formData.companyName}</p>
                          <p className="text-xs text-green-600">Entreprise sélectionnée</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, companyId: '', companyName: '' });
                          setSearchTerm('');
                        }}
                        className="text-green-600 hover:text-green-800 text-sm font-medium transition-colors"
                        disabled={loading}
                      >
                        Changer
                      </button>
                    </div>
                  </div>
                )}

                {/* Aucun résultat */}
                {searchTerm.length >= 2 && !loadingCompanies && companies.length === 0 && showResults && (
                  <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">
                      Aucune entreprise trouvée pour "{searchTerm}"
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingCompany(true);
                        setFormData({ ...formData, companyName: searchTerm });
                      }}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium hover:underline"
                    >
                      → Créer "{searchTerm}"
                    </button>
                  </div>
                )}

                {searchTerm.length > 0 && searchTerm.length < 2 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Entrez au moins 2 caractères pour rechercher
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Bouton Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading || (!isCreatingCompany && !formData.companyId)}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md mt-6"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Inscription en cours...
              </span>
            ) : (
              'S\'inscrire'
            )}
          </button>
        </div>

        {/* Lien vers Login */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 hover:underline font-medium transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
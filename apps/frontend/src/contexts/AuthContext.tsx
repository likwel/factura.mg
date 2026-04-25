// apps/frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface CompanyOwner {
  id: string;
  firstName: string;
  lastName: string;
  currentPlan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | null;
  subscriptionStatus: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED' | null;
  maxUsers: number | null;
  maxArticles: number | null;
  maxInvoices: number | null;
  maxStorage: number | null;
}

interface Company {
  id: string;
  name: string;
  email: string;
  logo?: string;
  ownerId: string;
  owner: CompanyOwner;
}

interface CompanyMembership {
  id: string;
  companyId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
  position?: string;
  company: Company;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  defaultCompanyId?: string;
  
  currentPlan?: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' | null;
  subscriptionStatus?: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED' | null;
  maxUsers?: number | null;
  maxArticles?: number | null;
  maxInvoices?: number | null;
  maxStorage?: number | null;
  
  companyMemberships: CompanyMembership[];
}

interface SubscriptionInfo {
  plan: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  status: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';
  isOwner: boolean;
  ownerName: string;
  trialEndDate?: string;
  nextBillingDate?: string;
  limits?: {
    users: { current: number; max: number; exceeded: boolean };
    articles: { current: number; max: number; exceeded: boolean };
    invoices: { current: number; max: number; exceeded: boolean };
    storage: { max: number; unit: string };
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  currentCompany: Company | null;
  currentMembership: CompanyMembership | null;
  subscription: SubscriptionInfo | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchCompany: (companyId: string) => Promise<void>;
  refreshSubscription: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error('❌ Erreur lors du chargement de l\'utilisateur:', error);
      return null;
    }
  });
  
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });
  
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(() => {
    return localStorage.getItem('currentCompanyId');
  });

  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(() => {
    try {
      const savedSubscription = localStorage.getItem('subscription');
      return savedSubscription ? JSON.parse(savedSubscription) : null;
    } catch (error) {
      return null;
    }
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Calculer currentCompany et currentMembership avec vérifications
  const currentMembership = user?.companyMemberships?.find(
    m => m.companyId === currentCompanyId
  ) || null;
  
  const currentCompany = currentMembership?.company || null;

  // ✅ Récupérer les informations d'abonnement
  const refreshSubscription = async () => {
    if (!token || !currentCompany) {
      console.log('⚠️ Skip refreshSubscription - missing token or company');
      return;
    }

    try {
      console.log('🔄 Refreshing subscription for company:', currentCompany.id);
      
      // TODO: Implémenter l'endpoint /subscription/limits côté backend
      // Pour l'instant, on utilise directement les données du owner
      
      const owner = currentCompany.owner;
      const isOwner = user?.id === owner.id;
      
      const subscriptionData: SubscriptionInfo = {
        plan: owner.currentPlan || 'STARTER',
        status: owner.subscriptionStatus || 'TRIAL',
        isOwner,
        ownerName: `${owner.firstName} ${owner.lastName}`,
        // Limites depuis le owner
        limits: {
          users: { 
            current: 0, // TODO: Récupérer depuis l'API
            max: owner.maxUsers || 5, 
            exceeded: false 
          },
          articles: { 
            current: 0, // TODO: Récupérer depuis l'API
            max: owner.maxArticles || 1000, 
            exceeded: false 
          },
          invoices: { 
            current: 0, // TODO: Récupérer depuis l'API
            max: owner.maxInvoices || 1000, 
            exceeded: false 
          },
          storage: { 
            max: owner.maxStorage || 5, 
            unit: 'GB' 
          }
        }
      };
      
      setSubscription(subscriptionData);
      localStorage.setItem('subscription', JSON.stringify(subscriptionData));
      
      console.log('✅ Subscription refreshed:', subscriptionData);
      
      /* 
      // Code pour quand l'endpoint sera prêt:
      const response = await api.get('/subscription/limits', {
        params: { companyId: currentCompany.id }
      });
      
      const subscriptionData: SubscriptionInfo = {
        plan: owner.currentPlan || 'STARTER',
        status: owner.subscriptionStatus || 'TRIAL',
        isOwner,
        ownerName: `${owner.firstName} ${owner.lastName}`,
        ...response.data
      };
      
      setSubscription(subscriptionData);
      localStorage.setItem('subscription', JSON.stringify(subscriptionData));
      */
      
    } catch (error) {
      console.error('❌ Erreur subscription:', error);
    }
  };

  // ✅ Vérifier le token au chargement
  useEffect(() => {
    const initAuth = async () => {
      console.log('🔍 Initializing auth - token:', token ? 'exists' : 'missing');
      
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          console.log('🔄 Fetching user from /auth/me');
          const response = await api.get('/auth/me');
          const userData = response.data;
          
          console.log('✅ User data received:', userData);
          
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          
          // ✅ Définir la company par défaut avec vérifications
          let defaultCompany = currentCompanyId;
          
          if (!defaultCompany) {
            defaultCompany = userData.defaultCompanyId;
          }
          
          if (!defaultCompany && userData.companyMemberships?.length > 0) {
            defaultCompany = userData.companyMemberships[0].companyId;
          }
          
          if (defaultCompany) {
            console.log('✅ Setting default company:', defaultCompany);
            setCurrentCompanyId(defaultCompany);
            localStorage.setItem('currentCompanyId', defaultCompany);
          } else {
            console.warn('⚠️ No company found for user');
          }

        } catch (error) {
          console.error('❌ Token invalide:', error);
          logout();
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []); // ✅ Exécuter une seule fois au montage

  // ✅ Rafraîchir subscription quand la company change
  useEffect(() => {
    if (currentCompany && token && !isLoading) {
      console.log('🔄 Company changed, refreshing subscription');
      refreshSubscription();
    }
  }, [currentCompanyId]); // ✅ Dépendre uniquement de currentCompanyId

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Login attempt for:', email);
      
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user: newUser } = response.data;
      
      console.log('✅ Login response:', response.data);
      
      if (!newUser || !newToken) {
        throw new Error('Réponse du serveur invalide');
      }
      
      setToken(newToken);
      setUser(newUser);
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // ✅ Définir la company active avec vérifications
      let defaultCompany = newUser.defaultCompanyId;
      
      if (!defaultCompany && newUser.companyMemberships?.length > 0) {
        defaultCompany = newUser.companyMemberships[0].companyId;
      }
      
      if (defaultCompany) {
        console.log('✅ Setting company after login:', defaultCompany);
        setCurrentCompanyId(defaultCompany);
        localStorage.setItem('currentCompanyId', defaultCompany);
      }
      
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      console.log('✅ Login successful');
    } catch (error: any) {
      console.error('❌ Erreur de connexion:', error);
      throw error;
    }
  };

  const switchCompany = async (companyId: string) => {
    console.log('🔄 Switching to company:', companyId);
    
    // ✅ Vérifier que l'utilisateur a accès à cette company
    const membership = user?.companyMemberships?.find(m => m.companyId === companyId);
    
    if (!membership) {
      console.error('❌ No access to company:', companyId);
      throw new Error('Vous n\'avez pas accès à cette entreprise');
    }

    setCurrentCompanyId(companyId);
    localStorage.setItem('currentCompanyId', companyId);

    // Sauvegarder comme company par défaut
    try {
      await api.patch('/auth/default-company', { companyId });
      
      if (user) {
        const updatedUser = { ...user, defaultCompanyId: companyId };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      
      console.log('✅ Company switched successfully');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
    }
  };

  const logout = () => {
    console.log('👋 Logging out');
    
    setToken(null);
    setUser(null);
    setCurrentCompanyId(null);
    setSubscription(null);
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentCompanyId');
    localStorage.removeItem('subscription');
    
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      currentCompany,
      currentMembership,
      subscription,
      login, 
      logout, 
      switchCompany,
      refreshSubscription,
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
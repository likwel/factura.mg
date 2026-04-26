// apps/frontend/src/hooks/usePermissions.ts
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook pour gérer les permissions utilisateur
 * Retourne des helpers pour vérifier les permissions selon le rôle et le plan
 */
export function usePermissions() {
  const { user, currentCompany, currentMembership, subscription } = useAuth();

  /**
   * Vérifier si l'utilisateur a un rôle spécifique dans l'organisation actuelle
   */
  const hasRole = (roles: string | string[]): boolean => {
    if (!currentMembership) return false;
    
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(currentMembership.role);
  };

  /**
   * Vérifier si l'utilisateur est le propriétaire de l'organisation actuelle
   */
  const isOwner = (): boolean => {
    if (!user || !currentCompany) return false;
    return currentCompany.ownerId === user.id;
  };

  /**
   * Vérifier si l'utilisateur est admin ou owner
   */
  const isAdminOrOwner = (): boolean => {
    return hasRole(['OWNER', 'ADMIN']);
  };

  /**
   * Vérifier si l'utilisateur peut modifier l'organisation
   */
  const canEditOrganization = (): boolean => {
    return isAdminOrOwner();
  };

  /**
   * Vérifier si l'utilisateur peut supprimer l'organisation
   */
  const canDeleteOrganization = (): boolean => {
    return isOwner();
  };

  /**
   * Vérifier si l'utilisateur peut inviter des membres
   */
  const canInviteMembers = (): boolean => {
    return isAdminOrOwner();
  };

  /**
   * Vérifier si l'utilisateur peut gérer les membres (modifier rôles, retirer)
   */
  const canManageMembers = (): boolean => {
    return isAdminOrOwner();
  };

  /**
   * Vérifier les limites du plan pour créer une nouvelle organisation
   */
  const canCreateOrganization = (): boolean => {
    if (!user || !subscription) return false;

    const limits: Record<string, number> = {
      STARTER: 1,
      PROFESSIONAL: 5,
      ENTERPRISE: -1 // Illimité
    };

    const limit = limits[subscription.plan] || 1;
    if (limit === -1) return true;

    // Compter les organisations dont l'utilisateur est propriétaire
    const ownedCount = user.companyMemberships.filter(
      m => m.company.ownerId === user.id
    ).length;

    return ownedCount < limit;
  };

  /**
   * Obtenir le nombre d'organisations restantes selon le plan
   */
  const getRemainingOrganizations = (): number | null => {
    if (!user || !subscription) return null;

    const limits: Record<string, number> = {
      STARTER: 1,
      PROFESSIONAL: 5,
      ENTERPRISE: -1 // Illimité
    };

    const limit = limits[subscription.plan] || 1;
    if (limit === -1) return -1; // Illimité

    const ownedCount = user.companyMemberships.filter(
      m => m.company.ownerId === user.id
    ).length;

    return Math.max(0, limit - ownedCount);
  };

  /**
   * Vérifier si l'utilisateur a accès à une fonctionnalité selon le plan
   */
  const hasFeatureAccess = (feature: string): boolean => {
    if (!subscription) return false;

    // Définir les fonctionnalités par plan
    const features: Record<string, string[]> = {
      STARTER: ['basic_invoicing', 'basic_inventory', 'basic_partners'],
      PROFESSIONAL: [
        'basic_invoicing', 
        'basic_inventory', 
        'basic_partners',
        'advanced_reporting',
        'multi_user',
        'api_access'
      ],
      ENTERPRISE: [
        'basic_invoicing', 
        'basic_inventory', 
        'basic_partners',
        'advanced_reporting',
        'multi_user',
        'api_access',
        'custom_integrations',
        'priority_support',
        'advanced_analytics',
        'white_label'
      ]
    };

    const planFeatures = features[subscription.plan] || features.STARTER;
    return planFeatures.includes(feature);
  };

  /**
   * Obtenir les limites du plan actuel
   */
  const getPlanLimits = () => {
    if (!subscription) return null;

    const planLimits: Record<string, any> = {
      STARTER: {
        organizations: 1,
        usersPerOrg: subscription.limits?.users.max || 3,
        storage: subscription.limits?.storage.max ? `${subscription.limits.storage.max}${subscription.limits.storage.unit}` : '1GB',
        invoicesPerMonth: subscription.limits?.invoices.max || 50,
        articlesPerMonth: subscription.limits?.articles.max || 100,
        features: ['Base']
      },
      PROFESSIONAL: {
        organizations: 5,
        usersPerOrg: subscription.limits?.users.max || 20,
        storage: subscription.limits?.storage.max ? `${subscription.limits.storage.max}${subscription.limits.storage.unit}` : '10GB',
        invoicesPerMonth: subscription.limits?.invoices.max || 500,
        articlesPerMonth: subscription.limits?.articles.max || 1000,
        features: ['Base', 'Avancé', 'Rapports', 'API']
      },
      ENTERPRISE: {
        organizations: -1, // Illimité
        usersPerOrg: -1,   // Illimité
        storage: 'Illimité',
        invoicesPerMonth: -1, // Illimité
        articlesPerMonth: -1, // Illimité
        features: ['Tout inclus', 'Support prioritaire', 'Personnalisation']
      }
    };

    return planLimits[subscription.plan] || planLimits.STARTER;
  };

  /**
   * Vérifier si une limite est dépassée
   */
  const isLimitExceeded = (limitType: 'users' | 'articles' | 'invoices'): boolean => {
    if (!subscription?.limits) return false;
    return subscription.limits[limitType]?.exceeded || false;
  };

  /**
   * Obtenir l'utilisation actuelle d'une limite
   */
  const getLimitUsage = (limitType: 'users' | 'articles' | 'invoices') => {
    if (!subscription?.limits) return null;
    return subscription.limits[limitType];
  };

  return {
    // Permissions de rôle
    hasRole,
    isOwner,
    isAdminOrOwner,
    canEditOrganization,
    canDeleteOrganization,
    canInviteMembers,
    canManageMembers,
    
    // Permissions de plan
    canCreateOrganization,
    getRemainingOrganizations,
    hasFeatureAccess,
    getPlanLimits,
    isLimitExceeded,
    getLimitUsage,
    
    // Données
    currentRole: currentMembership?.role,
    currentPlan: subscription?.plan,
    subscription
  };
}
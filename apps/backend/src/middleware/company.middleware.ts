// src/middleware/company.middleware.ts

import { Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthRequest } from './auth.middleware';
import { CompanyRole } from '@prisma/client';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────

export interface CompanyContext {
  id:          string;
  name:        string;
  email:       string;
  logo:        string | null;
  ownerId:     string;
  settings:    any;
  memberRole:  CompanyRole;        // rôle de l'utilisateur dans cette company
  isOwner:     boolean;
  plan: {
    currentPlan:        string | null;
    subscriptionStatus: string | null;
    maxUsers:           number;
    maxArticles:        number;
    maxInvoices:        number;
    maxStorage:         number;
  };
}

// Enrichissement de req avec le contexte company
declare global {
  namespace Express {
    interface Request {
      company?: CompanyContext;
    }
  }
}

// ─────────────────────────────────────────────────────────────
// HELPER — charge et valide le contexte company
// ─────────────────────────────────────────────────────────────

async function resolveCompany(
  req: AuthRequest,
  res: Response
): Promise<CompanyContext | null> {
  const user = req.user;

  if (!user) {
    res.status(401).json({ success: false, message: 'Non autorisé' });
    return null;
  }

  // Priorité : header x-company-id > query ?companyId > defaultCompanyId du user
  const companyId =
    (req.headers['x-company-id'] as string) ||
    (req.query.companyId as string)          ||
    user.companyId                           ||
    null;

  if (!companyId) {
    res.status(400).json({
      success: false,
      message: "Aucune entreprise sélectionnée. Fournissez l'en-tête x-company-id.",
    });
    return null;
  }

  // Vérifier que l'utilisateur est bien membre actif de cette company
  const membership = await prisma.companyMember.findFirst({
    where: {
      userId:    user.id,
      companyId,
      isActive:  true,
    },
    include: {
      company: {
        include: {
          owner: {
            select: {
              id:                 true,
              currentPlan:        true,
              subscriptionStatus: true,
              maxUsers:           true,
              maxArticles:        true,
              maxInvoices:        true,
              maxStorage:         true,
            },
          },
        },
      },
    },
  });

  if (!membership) {
    res.status(403).json({
      success: false,
      message: "Vous n'êtes pas membre de cette entreprise ou votre accès a été révoqué.",
    });
    return null;
  }

  const { company } = membership;

  // SUPER_ADMIN bypass : peut accéder à toutes les companies sans être membre
  // (déjà géré par le membership check ci-dessus — à ajuster si besoin)

  return {
    id:         company.id,
    name:       company.name,
    email:      company.email,
    logo:       company.logo,
    ownerId:    company.ownerId,
    settings:   company.settings,
    memberRole: membership.role,
    isOwner:    company.ownerId === user.id,
    plan: {
      currentPlan:        company.owner.currentPlan        ?? 'STARTER',
      subscriptionStatus: company.owner.subscriptionStatus ?? 'TRIAL',
      maxUsers:           company.owner.maxUsers           ?? 5,
      maxArticles:        company.owner.maxArticles        ?? 1000,
      maxInvoices:        company.owner.maxInvoices        ?? 1000,
      maxStorage:         company.owner.maxStorage         ?? 5,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// 1. requireCompany — vérifie qu'un contexte company est actif
// ─────────────────────────────────────────────────────────────

export const requireCompany = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const company = await resolveCompany(req, res);
  if (!company) return;           // réponse déjà envoyée

  req.company = company;

  // Met à jour companyId sur req.user pour les controllers
  req.user!.companyId = company.id;

  next();
};

// ─────────────────────────────────────────────────────────────
// 2. requireCompanyRole — restreint à un ou plusieurs rôles company
//    Usage : router.delete('/:id', requireCompanyRole('OWNER', 'ADMIN'))
// ─────────────────────────────────────────────────────────────

export const requireCompanyRole = (...roles: CompanyRole[]) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // Si requireCompany a déjà été appelé, on réutilise le contexte
    if (!req.company) {
      const company = await resolveCompany(req, res);
      if (!company) return;
      req.company = company;
      req.user!.companyId = company.id;
    }

    const { memberRole } = req.company;

    // SUPER_ADMIN global passe toujours
    if (req.user!.role === 'SUPER_ADMIN') {
      next();
      return;
    }

    if (!roles.includes(memberRole)) {
      res.status(403).json({
        success:  false,
        message:  `Rôle requis dans cette entreprise : ${roles.join(' ou ')}. Votre rôle actuel : ${memberRole}`,
      });
      return;
    }

    next();
  };
};

// ─────────────────────────────────────────────────────────────
// 3. requireCompanyOwner — seul le propriétaire (OWNER) peut passer
// ─────────────────────────────────────────────────────────────

export const requireCompanyOwner = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.company) {
    const company = await resolveCompany(req, res);
    if (!company) return;
    req.company = company;
    req.user!.companyId = company.id;
  }

  if (req.user!.role === 'SUPER_ADMIN') { next(); return; }

  if (!req.company.isOwner) {
    res.status(403).json({
      success: false,
      message: 'Seul le propriétaire de cette entreprise peut effectuer cette action.',
    });
    return;
  }

  next();
};

// ─────────────────────────────────────────────────────────────
// 4. checkPlanLimit — vérifie les limites du plan avant création
//    Usage : router.post('/', checkPlanLimit('invoices'), ...)
// ─────────────────────────────────────────────────────────────

type LimitKey = 'users' | 'articles' | 'invoices';

const limitMap: Record<LimitKey, { field: 'maxUsers' | 'maxArticles' | 'maxInvoices'; label: string }> = {
  users:    { field: 'maxUsers',    label: 'utilisateurs' },
  articles: { field: 'maxArticles', label: 'articles'     },
  invoices: { field: 'maxInvoices', label: 'factures'     },
};

export const checkPlanLimit = (resource: LimitKey) => {
  return async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    if (!req.company) {
      const company = await resolveCompany(req, res);
      if (!company) return;
      req.company = company;
      req.user!.companyId = company.id;
    }

    const companyId = req.company.id;
    const { field, label } = limitMap[resource];
    const limit = req.company.plan[field];

    let currentCount = 0;

    switch (resource) {
      case 'users':
        currentCount = await prisma.companyMember.count({ where: { companyId, isActive: true } });
        break;
      case 'articles':
        currentCount = await prisma.article.count({ where: { companyId, isActive: true } });
        break;
      case 'invoices':
        currentCount = await prisma.invoice.count({ where: { companyId } });
        break;
    }

    if (currentCount >= limit) {
      res.status(403).json({
        success: false,
        message: `Limite atteinte : votre plan autorise ${limit} ${label}. Passez à un plan supérieur pour continuer.`,
        limit,
        current: currentCount,
        resource,
      });
      return;
    }

    next();
  };
};

// ─────────────────────────────────────────────────────────────
// 5. requireActiveSubscription — bloque si trial expiré ou cancelled
// ─────────────────────────────────────────────────────────────

export const requireActiveSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.company) {
    const company = await resolveCompany(req, res);
    if (!company) return;
    req.company = company;
    req.user!.companyId = company.id;
  }

  const { subscriptionStatus } = req.company.plan;

  const blockedStatuses = ['CANCELLED', 'EXPIRED'];

  if (blockedStatuses.includes(subscriptionStatus ?? '')) {
    res.status(402).json({
      success: false,
      message: `Abonnement ${subscriptionStatus?.toLowerCase()}. Renouvelez votre abonnement pour accéder à cette fonctionnalité.`,
      subscriptionStatus,
    });
    return;
  }

  next();
};
// backend/src/services/partner.service.ts

import { prisma } from '../index';
import { AppError } from '../utils/AppError';

/* =========================
   TYPES
========================= */

interface PartnerCreateData {
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  creditLimit?: number;
  type: 'client' | 'supplier';
  companyId: string;
}

interface PartnerUpdateData {
  code?: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  creditLimit?: number;
  isActive?: boolean;
}

interface PartnerFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

/* =========================
   CREATE PARTNER
========================= */

export const createPartner = async (data: PartnerCreateData) => {
  const { type, companyId, code, ...partnerData } = data;

  // CLIENT
  if (type === 'client') {
    const existing = await prisma.client.findFirst({
      where: { code, companyId }
    });

    if (existing) {
      throw new AppError('Un client avec ce code existe déjà', 400);
    }

    const client = await prisma.client.create({
      data: {
        code,
        companyId,
        ...partnerData
      }
    });

    return { ...client, type: 'client' as const };
  }

  // SUPPLIER
  const existing = await prisma.supplier.findFirst({
    where: { code, companyId }
  });

  if (existing) {
    throw new AppError('Un fournisseur avec ce code existe déjà', 400);
  }

  const supplier = await prisma.supplier.create({
    data: {
      code,
      companyId,
      ...partnerData
    }
  });

  return { ...supplier, type: 'supplier' as const };
};

/* =========================
   GET PARTNERS (ALL)
========================= */

export const getPartners = async (
  companyId: string,
  filters: PartnerFilters = {}
) => {
  const { search, isActive, page = 1, limit = 10 } = filters;

  const where: any = { companyId };

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { code: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  const skip = (page - 1) * limit;

  const [clients, suppliers, totalClients, totalSuppliers] =
    await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.supplier.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.client.count({ where }),
      prisma.supplier.count({ where })
    ]);

  const data = [
    ...clients.map(c => ({ ...c, type: 'client' as const })),
    ...suppliers.map(s => ({ ...s, type: 'supplier' as const }))
  ];

  const total = totalClients + totalSuppliers;

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

/* =========================
   GET BY ID
========================= */

export const getPartnerById = async (
  id: string,
  companyId: string
) => {
  const client = await prisma.client.findFirst({
    where: { id, companyId }
  });

  if (client) {
    return { ...client, type: 'client' as const };
  }

  const supplier = await prisma.supplier.findFirst({
    where: { id, companyId }
  });

  if (supplier) {
    return { ...supplier, type: 'supplier' as const };
  }

  return null;
};

/* =========================
   UPDATE PARTNER
========================= */

export const updatePartner = async (
  id: string,
  companyId: string,
  data: PartnerUpdateData
) => {
  const partner = await getPartnerById(id, companyId);

  if (!partner) {
    throw new AppError('Partenaire non trouvé', 404);
  }

  // CHECK CODE UNIQUENESS
  if (data.code) {
    const existing =
      partner.type === 'client'
        ? await prisma.client.findFirst({
            where: {
              code: data.code,
              companyId,
              id: { not: id }
            }
          })
        : await prisma.supplier.findFirst({
            where: {
              code: data.code,
              companyId,
              id: { not: id }
            }
          });

    if (existing) {
      throw new AppError('Code déjà utilisé', 400);
    }
  }

  // UPDATE SAFE
  const updated =
    partner.type === 'client'
      ? await prisma.client.update({
          where: { id },
          data
        })
      : await prisma.supplier.update({
          where: { id },
          data
        });

  return { ...updated, type: partner.type };
};

/* =========================
   DELETE PARTNER
========================= */

export const deletePartner = async (
  id: string,
  companyId: string
) => {
  const partner = await getPartnerById(id, companyId);

  if (!partner) {
    throw new AppError('Partenaire non trouvé', 404);
  }

  const hasInvoices =
    partner.type === 'client'
      ? await prisma.invoice.count({ where: { clientId: id } })
      : await prisma.invoice.count({ where: { clientId: id } });

  if (hasInvoices > 0) {
    throw new AppError(
      'Impossible de supprimer ce partenaire (documents existants)',
      400
    );
  }

  if (partner.type === 'client') {
    await prisma.client.delete({ where: { id } });
  } else {
    await prisma.supplier.delete({ where: { id } });
  }

  return true;
};
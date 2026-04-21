// backend/src/controllers/partner.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as partnerService from '../services/partner.service';
import { AuthRequest } from '../types/express';
import { AppError } from '../utils/AppError';

/**
 * Create a new partner (client or supplier)
 */
export const createPartner = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const companyId = req.user!.companyId;
    const partnerData = { ...req.body, companyId };

    const partner = await partnerService.createPartner(partnerData);

    res.status(201).json({
      success: true,
      data: partner,
      message: 'Partenaire créé avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all partners for the company
 */
export const getPartners = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const companyId = req.user!.companyId;
    const { search, isActive, page, limit } = req.query;

    const result = await partnerService.getPartners(companyId, {
      search: search as string,
      isActive: isActive === 'true',
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all client partners
 */
export const getClientPartners = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const companyId = req.user!.companyId;

    const clients = await partnerService.getClientPartners(companyId);

    res.status(200).json({
      success: true,
      data: clients
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all supplier partners
 */
export const getSupplierPartners = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const companyId = req.user!.companyId;

    const suppliers = await partnerService.getSupplierPartners(companyId);

    res.status(200).json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get partner by ID
 */
export const getPartnerById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;

    const partner = await partnerService.getPartnerById(id, companyId);

    if (!partner) {
      throw new AppError('Partenaire non trouvé', 404);
    }

    res.status(200).json({
      success: true,
      data: partner
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update partner
 */
export const updatePartner = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;
    const updateData = req.body;

    const partner = await partnerService.updatePartner(id, companyId, updateData);

    res.status(200).json({
      success: true,
      data: partner,
      message: 'Partenaire mis à jour avec succès'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete partner
 */
export const deletePartner = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const companyId = req.user!.companyId;

    await partnerService.deletePartner(id, companyId);

    res.status(200).json({
      success: true,
      message: 'Partenaire supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};
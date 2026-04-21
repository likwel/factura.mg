// backend/src/routes/partner.routes.ts

import { Router } from 'express';
import {
  createPartner,
  getPartners,
  getPartnerById,
  updatePartner,
  deletePartner,
  getClientPartners,
  getSupplierPartners
} from '../controllers/partner.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import {
  createPartnerSchema,
  updatePartnerSchema,
  partnerIdSchema
} from '../validators/partner.validator';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/partners
 * @desc    Create a new partner (client or supplier)
 * @access  Private
 */
router.post(
  '/',
  validateRequest(createPartnerSchema),
  createPartner
);

/**
 * @route   GET /api/partners
 * @desc    Get all partners for the authenticated user's company
 * @access  Private
 */
router.get('/', getPartners);

/**
 * @route   GET /api/partners/clients
 * @desc    Get all client partners
 * @access  Private
 */
router.get('/clients', getClientPartners);

/**
 * @route   GET /api/partners/suppliers
 * @desc    Get all supplier partners
 * @access  Private
 */
router.get('/suppliers', getSupplierPartners);

/**
 * @route   GET /api/partners/:id
 * @desc    Get partner by ID
 * @access  Private
 */
router.get(
  '/:id',
  validateRequest(partnerIdSchema, 'params'),
  getPartnerById
);

/**
 * @route   PUT /api/partners/:id
 * @desc    Update partner
 * @access  Private
 */
router.put(
  '/:id',
  validateRequest(partnerIdSchema, 'params'),
  validateRequest(updatePartnerSchema),
  updatePartner
);

/**
 * @route   DELETE /api/partners/:id
 * @desc    Delete partner
 * @access  Private
 */
router.delete(
  '/:id',
  validateRequest(partnerIdSchema, 'params'),
  deletePartner
);

export default router;
// backend/src/routes/message.routes.ts
import { Router, Request, Response } from 'express';
import { messageController } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadConfig, handleUploadError } from '../config/upload.config';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// GET /api/messages - Récupérer les messages avec filtres
router.get('/', (req: Request, res: Response) => messageController.getMessages(req, res));

// GET /api/messages/stats - Obtenir les statistiques
router.get('/stats', (req: Request, res: Response) => messageController.getStats(req, res));

// GET /api/messages/:id - Récupérer un message spécifique
router.get('/:id', (req: Request, res: Response) => messageController.getMessageById(req, res));

// POST /api/messages - Créer un nouveau message (avec pièces jointes)
router.post(
  '/',
  uploadConfig.array('attachments', 5),
  handleUploadError,
  (req: Request, res: Response) => messageController.createMessage(req, res)
);

// PATCH /api/messages/:id - Mettre à jour un message
router.patch('/:id', (req: Request, res: Response) => messageController.updateMessage(req, res));

// DELETE /api/messages/:id - Supprimer un message (déplacer à la corbeille ou définitivement)
// ?permanent=true pour suppression définitive
router.delete('/:id', (req: Request, res: Response) => messageController.deleteMessage(req, res));

// POST /api/messages/:id/restore - Restaurer un message de la corbeille
router.post('/:id/restore', (req: Request, res: Response) => messageController.restoreFromTrash(req, res));

// POST /api/messages/trash/empty - Vider la corbeille
router.post('/trash/empty', (req: Request, res: Response) => messageController.emptyTrash(req, res));

export default router;
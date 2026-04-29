// backend/src/controllers/message.controller.ts
import { Request, Response } from 'express';
import { messageService } from '../services/message.service';
import { z } from 'zod';
import { MessageStatus, AttachmentType } from '@prisma/client';

const createMessageSchema = z.object({
  receiverId: z.string().uuid().optional(),
  subject: z.string().min(1).max(200),
  content: z.string().min(1),
  isImportant: z.union([z.boolean(), z.string()]).transform(val => val === 'true' || val === true).optional(),
  isDraft: z.union([z.boolean(), z.string()]).transform(val => val === 'true' || val === true).optional()
});

const updateMessageSchema = z.object({
  subject: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  receiverId: z.string().uuid().optional(),
  isRead: z.boolean().optional(),
  isImportant: z.boolean().optional(),
  status: z.nativeEnum(MessageStatus).optional()
});

const queryMessagesSchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional()
});

export class MessageController {
  async getMessages(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const companyId = req.user?.companyId;

      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      if (!companyId) {
        return res.status(403).json({ error: 'Vous devez être associé à une entreprise' });
      }

      const query = queryMessagesSchema.parse(req.query);
      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '50');

      const result = await messageService.getMessages({
        userId,
        companyId,
        status: query.status as any,
        search: query.search,
        page,
        limit
      });

      res.json(result);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des messages' });
    }
  }

  async getMessageById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const companyId = req.user?.companyId;

      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      if (!companyId) {
        return res.status(403).json({ error: 'Vous devez être associé à une entreprise' });
      }

      const message = await messageService.getMessageById(id, userId, companyId);

      if (!message) {
        return res.status(404).json({ error: 'Message non trouvé' });
      }

      res.json(message);
    } catch (error) {
      console.error('Error fetching message:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération du message' });
    }
  }

  async createMessage(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const companyId = req.user?.companyId;

      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      if (!companyId) {
        return res.status(403).json({ error: 'Vous devez être associé à une entreprise' });
      }

      const data = createMessageSchema.parse(req.body);

      // Gérer les pièces jointes uploadées
      const attachments = req.files as Express.Multer.File[];
      const attachmentData = attachments?.map(file => {
        const type = this.getAttachmentType(file.mimetype);
        return {
          fileName: file.filename,
          originalName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          type,
          url: `/uploads/attachments/${file.filename}`
        };
      });

      const message = await messageService.createMessage({
        ...data,
        senderId: userId,
        companyId,
        attachments: attachmentData
      });

      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Données invalides', details: error.errors });
      }
      console.error('Error creating message:', error);
      res.status(500).json({ error: 'Erreur lors de la création du message' });
    }
  }

  async updateMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const companyId = req.user?.companyId;

      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      if (!companyId) {
        return res.status(403).json({ error: 'Vous devez être associé à une entreprise' });
      }

      const data = updateMessageSchema.parse(req.body);

      const message = await messageService.updateMessage(id, userId, companyId, data);

      if (!message) {
        return res.status(404).json({ error: 'Message non trouvé' });
      }

      res.json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Données invalides', details: error.errors });
      }
      console.error('Error updating message:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du message' });
    }
  }

  async deleteMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const companyId = req.user?.companyId;
      const permanent = req.query.permanent === 'true';

      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      if (!companyId) {
        return res.status(403).json({ error: 'Vous devez être associé à une entreprise' });
      }

      const deleted = await messageService.deleteMessage(id, userId, companyId, permanent);

      if (!deleted) {
        return res.status(404).json({ error: 'Message non trouvé' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression du message' });
    }
  }

  async restoreFromTrash(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const companyId = req.user?.companyId;

      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      if (!companyId) {
        return res.status(403).json({ error: 'Vous devez être associé à une entreprise' });
      }

      const message = await messageService.restoreFromTrash(id, userId, companyId);

      if (!message) {
        return res.status(404).json({ error: 'Message non trouvé dans la corbeille' });
      }

      res.json(message);
    } catch (error) {
      console.error('Error restoring message:', error);
      res.status(500).json({ error: 'Erreur lors de la restauration du message' });
    }
  }

  async emptyTrash(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const companyId = req.user?.companyId;

      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      if (!companyId) {
        return res.status(403).json({ error: 'Vous devez être associé à une entreprise' });
      }

      const count = await messageService.emptyTrash(userId, companyId);

      res.json({ count, message: `${count} message(s) supprimé(s) définitivement` });
    } catch (error) {
      console.error('Error emptying trash:', error);
      res.status(500).json({ error: 'Erreur lors du vidage de la corbeille' });
    }
  }

  async getStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const companyId = req.user?.companyId;

      if (!userId) {
        return res.status(401).json({ error: 'Non authentifié' });
      }

      if (!companyId) {
        return res.status(403).json({ error: 'Vous devez être associé à une entreprise' });
      }

      const stats = await messageService.getStats(userId, companyId);

      res.json(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
  }

  private getAttachmentType(mimeType: string): AttachmentType {
    if (mimeType.startsWith('image/')) {
      return AttachmentType.IMAGE;
    } else if (
      mimeType === 'application/pdf' ||
      mimeType.includes('document') ||
      mimeType.includes('text') ||
      mimeType.includes('sheet') ||
      mimeType.includes('presentation')
    ) {
      return AttachmentType.DOCUMENT;
    }
    return AttachmentType.FILE;
  }
}

export const messageController = new MessageController();
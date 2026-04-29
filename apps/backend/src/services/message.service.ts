// backend/src/services/message.service.ts
import { PrismaClient, MessageStatus, AttachmentType } from '@prisma/client';

const prisma = new PrismaClient();

interface GetMessagesParams {
  userId: string;
  companyId: string;
  status?: MessageStatus | 'unread' | 'starred' | 'inbox';
  search?: string;
  page: number;
  limit: number;
}

interface CreateMessageData {
  senderId: string;
  receiverId?: string;
  companyId: string;
  subject: string;
  content: string;
  isImportant?: boolean;
  isDraft?: boolean;
  attachments?: Array<{
    fileName: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    type: AttachmentType;
    url: string;
  }>;
}

interface UpdateMessageData {
  subject?: string;
  content?: string;
  receiverId?: string;
  isRead?: boolean;
  isImportant?: boolean;
  status?: MessageStatus;
  sentAt?: Date;
}

class MessageService {
  async getMessages(params: GetMessagesParams) {
    const { userId, companyId, status, search, page, limit } = params;
    const skip = (page - 1) * limit;

    let where: any = {
      companyId,
      status: { not: MessageStatus.TRASH }
    };

    // Gestion des différents statuts/filtres
    if (status === 'inbox' || !status) {
      where.receiverId = userId;
      where.status = MessageStatus.SENT;
    } else if (status === 'unread') {
      where.receiverId = userId;
      where.isRead = false;
      where.status = MessageStatus.SENT;
    } else if (status === 'starred') {
      where.receiverId = userId;
      where.isImportant = true;
      where.status = MessageStatus.SENT;
    } else if (status === MessageStatus.SENT) {
      where.senderId = userId;
      where.status = MessageStatus.SENT;
    } else if (status === MessageStatus.DRAFT) {
      where.senderId = userId;
      where.status = MessageStatus.DRAFT;
    } else if (status === MessageStatus.ARCHIVED) {
      where.OR = [
        { senderId: userId },
        { receiverId: userId }
      ];
      where.status = MessageStatus.ARCHIVED;
    } else if (status === MessageStatus.TRASH) {
      where.OR = [
        { senderId: userId },
        { receiverId: userId }
      ];
      where.status = MessageStatus.TRASH;
    }

    // Recherche
    if (search) {
      where.AND = [
        where.AND || {},
        {
          OR: [
            { subject: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } },
            { 
              sender: { 
                OR: [
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } },
                  { email: { contains: search, mode: 'insensitive' } }
                ]
              } 
            }
          ]
        }
      ];
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          attachments: {
            select: {
              id: true,
              fileName: true,
              originalName: true,
              fileSize: true,
              mimeType: true,
              type: true,
              url: true
            }
          }
        },
        orderBy: [
          { isImportant: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.message.count({ where })
    ]);

    // Formater les messages pour le frontend
    const formattedMessages = messages.map(msg => ({
      ...msg,
      sender: {
        id: msg.sender.id,
        name: `${msg.sender.firstName} ${msg.sender.lastName}`,
        email: msg.sender.email
      },
      receiver: msg.receiver ? {
        id: msg.receiver.id,
        name: `${msg.receiver.firstName} ${msg.receiver.lastName}`,
        email: msg.receiver.email
      } : undefined
    }));

    return {
      messages: formattedMessages,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getMessageById(id: string, userId: string, companyId: string) {
    const message = await prisma.message.findFirst({
      where: {
        id,
        companyId,
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        attachments: {
          select: {
            id: true,
            fileName: true,
            originalName: true,
            fileSize: true,
            mimeType: true,
            type: true,
            url: true
          }
        }
      }
    });

    if (!message) return null;

    // Marquer comme lu si destinataire et message envoyé
    if (message.receiverId === userId && !message.isRead && message.status === MessageStatus.SENT) {
      await prisma.message.update({
        where: { id },
        data: { isRead: true }
      });
      message.isRead = true;
    }

    // Formater pour le frontend
    return {
      ...message,
      sender: {
        id: message.sender.id,
        name: `${message.sender.firstName} ${message.sender.lastName}`,
        email: message.sender.email
      },
      receiver: message.receiver ? {
        id: message.receiver.id,
        name: `${message.receiver.firstName} ${message.receiver.lastName}`,
        email: message.receiver.email
      } : undefined
    };
  }

  async createMessage(data: CreateMessageData) {
    const isDraft = data.isDraft || !data.receiverId;

    // Si pas un brouillon, vérifier le destinataire
    if (!isDraft && data.receiverId) {
      const receiver = await prisma.user.findFirst({
        where: {
          id: data.receiverId,
          defaultCompanyId: data.companyId
        }
      });

      if (!receiver) {
        throw new Error('Destinataire non trouvé dans cette entreprise');
      }
    }

    const message = await prisma.message.create({
      data: {
        senderId: data.senderId,
        receiverId: data.receiverId,
        companyId: data.companyId,
        subject: data.subject,
        content: data.content,
        isImportant: data.isImportant || false,
        status: isDraft ? MessageStatus.DRAFT : MessageStatus.SENT,
        sentAt: isDraft ? null : new Date(),
        attachments: data.attachments ? {
          create: data.attachments
        } : undefined
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        attachments: true
      }
    });

    // Formater pour le frontend
    return {
      ...message,
      sender: {
        id: message.sender.id,
        name: `${message.sender.firstName} ${message.sender.lastName}`,
        email: message.sender.email
      },
      receiver: message.receiver ? {
        id: message.receiver.id,
        name: `${message.receiver.firstName} ${message.receiver.lastName}`,
        email: message.receiver.email
      } : undefined
    };
  }

  async updateMessage(id: string, userId: string, companyId: string, data: UpdateMessageData) {
    const existingMessage = await prisma.message.findFirst({
      where: {
        id,
        companyId,
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }
    });

    if (!existingMessage) {
      return null;
    }

    if (existingMessage.senderId !== userId && (data.subject || data.content || data.receiverId)) {
      throw new Error('Vous ne pouvez pas modifier le contenu d\'un message reçu');
    }

    const updateData = { ...data };
    if (data.status === MessageStatus.SENT && existingMessage.status === MessageStatus.DRAFT) {
      if (!data.receiverId && !existingMessage.receiverId) {
        throw new Error('Un destinataire est requis pour envoyer le message');
      }
      updateData.sentAt = new Date();
    }

    const message = await prisma.message.update({
      where: { id },
      data: updateData,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        attachments: true
      }
    });

    // Formater pour le frontend
    return {
      ...message,
      sender: {
        id: message.sender.id,
        name: `${message.sender.firstName} ${message.sender.lastName}`,
        email: message.sender.email
      },
      receiver: message.receiver ? {
        id: message.receiver.id,
        name: `${message.receiver.firstName} ${message.receiver.lastName}`,
        email: message.receiver.email
      } : undefined
    };
  }

  async deleteMessage(id: string, userId: string, companyId: string, permanent: boolean = false) {
    const existingMessage = await prisma.message.findFirst({
      where: {
        id,
        companyId,
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }
    });

    if (!existingMessage) {
      return false;
    }

    if (permanent || existingMessage.status === MessageStatus.TRASH) {
      await prisma.message.delete({
        where: { id }
      });
    } else {
      await prisma.message.update({
        where: { id },
        data: {
          status: MessageStatus.TRASH,
          trashedAt: new Date()
        }
      });
    }

    return true;
  }

  async restoreFromTrash(id: string, userId: string, companyId: string) {
    const message = await prisma.message.findFirst({
      where: {
        id,
        companyId,
        status: MessageStatus.TRASH,
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }
    });

    if (!message) {
      return null;
    }

    const previousStatus = message.sentAt ? MessageStatus.SENT : MessageStatus.DRAFT;

    const restored = await prisma.message.update({
      where: { id },
      data: {
        status: previousStatus,
        trashedAt: null
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        attachments: true
      }
    });

    // Formater pour le frontend
    return {
      ...restored,
      sender: {
        id: restored.sender.id,
        name: `${restored.sender.firstName} ${restored.sender.lastName}`,
        email: restored.sender.email
      },
      receiver: restored.receiver ? {
        id: restored.receiver.id,
        name: `${restored.receiver.firstName} ${restored.receiver.lastName}`,
        email: restored.receiver.email
      } : undefined
    };
  }

  async emptyTrash(userId: string, companyId: string) {
    const result = await prisma.message.deleteMany({
      where: {
        companyId,
        status: MessageStatus.TRASH,
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      }
    });

    return result.count;
  }

  async getStats(userId: string, companyId: string) {
    const [inbox, unread, starred, sent, drafts, archived, trash] = await Promise.all([
      prisma.message.count({
        where: {
          companyId,
          receiverId: userId,
          isRead: false,
          status: MessageStatus.SENT
        }
      }),
      prisma.message.count({
        where: {
          companyId,
          receiverId: userId,
          isRead: false,
          status: MessageStatus.SENT
        }
      }),
      prisma.message.count({
        where: {
          companyId,
          receiverId: userId,
          isImportant: true,
          isRead: false,
          status: MessageStatus.SENT
        }
      }),
      prisma.message.count({
        where: {
          companyId,
          senderId: userId,
          isRead: false,
          status: MessageStatus.SENT
        }
      }),
      prisma.message.count({
        where: {
          companyId,
          senderId: userId,
          isRead: false,
          status: MessageStatus.DRAFT
        }
      }),
      prisma.message.count({
        where: {
          companyId,
          status: MessageStatus.ARCHIVED,
          isRead: false,
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      }),
      prisma.message.count({
        where: {
          companyId,
          status: MessageStatus.TRASH,
          isRead: false,
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      })
    ]);

    return {
      inbox,
      unread,
      starred,
      sent,
      drafts,
      archived,
      trash
    };
  }
}

export const messageService = new MessageService();
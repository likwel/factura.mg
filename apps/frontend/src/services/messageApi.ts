// apps/frontend/src/services/messageApi.ts
import api from './api'; // ✅ Utilise votre instance axios existante

export enum MessageStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ARCHIVED = 'ARCHIVED',
  TRASH = 'TRASH'
}

export enum AttachmentType {
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  FILE = 'FILE'
}

export interface Attachment {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  type: AttachmentType;
  url: string;
}

export interface Message {
  id: string;
  subject: string;
  content: string;
  status: MessageStatus;
  isRead: boolean;
  isImportant: boolean;
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
  trashedAt: string | null;
  sender: {
    id: string;
    name: string;
    email: string;
  };
  receiver?: {
    id: string;
    name: string;
    email: string;
  };
  attachments: Attachment[];
}

export interface MessageStats {
  inbox: number;
  unread: number;
  starred: number;
  sent: number;
  drafts: number;
  archived: number;
  trash: number;
}

export interface GetMessagesParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateMessageData {
  receiverId?: string;
  subject: string;
  content: string;
  isImportant?: boolean;
  isDraft?: boolean;
  attachments?: File[];
}

export interface UpdateMessageData {
  subject?: string;
  content?: string;
  receiverId?: string;
  isRead?: boolean;
  isImportant?: boolean;
  status?: MessageStatus;
}

class MessageApi {
  async getMessages(params: GetMessagesParams = {}) {
    const response = await api.get<{
      messages: Message[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>('/messages', { params });
    return response.data;
  }

  async getMessageById(id: string) {
    const response = await api.get<Message>(`/messages/${id}`);
    return response.data;
  }

  async createMessage(data: CreateMessageData) {
    const formData = new FormData();
    
    if (data.receiverId) formData.append('receiverId', data.receiverId);
    formData.append('subject', data.subject);
    formData.append('content', data.content);
    if (data.isImportant) formData.append('isImportant', 'true');
    if (data.isDraft) formData.append('isDraft', 'true');
    
    if (data.attachments) {
      data.attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }

    const response = await api.post<Message>('/messages', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  }

  async updateMessage(id: string, data: UpdateMessageData) {
    const response = await api.patch<Message>(`/messages/${id}`, data);
    return response.data;
  }

  async deleteMessage(id: string, permanent: boolean = false) {
    await api.delete(`/messages/${id}`, {
      params: { permanent }
    });
  }

  async restoreFromTrash(id: string) {
    const response = await api.post<Message>(`/messages/${id}/restore`);
    return response.data;
  }

  async emptyTrash() {
    const response = await api.post<{ count: number; message: string }>('/messages/trash/empty');
    return response.data;
  }

  async getStats() {
    const response = await api.get<MessageStats>('/messages/stats');
    return response.data;
  }

  async downloadAttachment(attachment: Attachment) {
    const response = await api.get(attachment.url, {
      responseType: 'blob'
    });
    
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', attachment.originalName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  getAttachmentUrl(url: string) {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    return `${API_BASE_URL.replace('/api', '')}${url}`;
  }
}

export const messageApi = new MessageApi();
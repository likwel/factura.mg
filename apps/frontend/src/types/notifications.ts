// apps/frontend/src/types/notifications.ts
export interface AppMessage {
  id: string;
  sender: string;
  avatar?: string;
  subject: string;
  preview: string;
  timestamp: string;
  read: boolean;
  important?: boolean;
}

export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  icon?: string;
}
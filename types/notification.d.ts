export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  data: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type NotificationListResponse = Notification[];

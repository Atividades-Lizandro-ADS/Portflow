export interface NotificationTemplate {
  code: string;
  label: string;
}

export interface AppNotification {
  id: number;
  title: string;
  is_read: boolean;
  created_at: string;
  template: NotificationTemplate | null;
  target_post_id: number | null;
}

export interface NotificationPage {
  count: number;
  next: string | null;
  results: AppNotification[];
}

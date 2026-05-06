export type NotificationChannel = "email" | "webhook" | "browser";

export interface NotificationPreferences {
  userId: string;
  channels: NotificationChannel[];
  reminderAlerts: boolean;
  weeklyDigest: boolean;
  webhookUrl?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "reminder" | "digest" | "share_expiry" | "import_complete";
  title: string;
  body: string;
  channel: NotificationChannel;
  sentAt: string;
  read: boolean;
}

export interface NotificationStore {
  preferences: Map<string, NotificationPreferences>;
  notifications: Map<string, Notification>;
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function createInMemoryNotificationStore(): NotificationStore {
  return {
    preferences: new Map(),
    notifications: new Map(),
  };
}

export function createNotificationService(store: NotificationStore) {
  return {
    setPreferences(prefs: NotificationPreferences): NotificationPreferences {
      store.preferences.set(prefs.userId, prefs);
      return prefs;
    },

    getPreferences(userId: string): NotificationPreferences | undefined {
      return store.preferences.get(userId);
    },

    send(
      userId: string,
      type: Notification["type"],
      title: string,
      body: string,
      channel: NotificationChannel = "browser"
    ): Notification {
      const notification: Notification = {
        id: generateId(),
        userId,
        type,
        title,
        body,
        channel,
        sentAt: new Date().toISOString(),
        read: false,
      };
      store.notifications.set(notification.id, notification);
      return notification;
    },

    getForUser(userId: string): Notification[] {
      return Array.from(store.notifications.values()).filter(
        (n) => n.userId === userId
      );
    },

    markRead(id: string): boolean {
      const n = store.notifications.get(id);
      if (!n) return false;
      store.notifications.set(id, { ...n, read: true });
      return true;
    },

    deleteNotification(id: string): boolean {
      return store.notifications.delete(id);
    },
  };
}

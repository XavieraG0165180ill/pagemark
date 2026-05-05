import { Bookmark } from "../models/bookmark";

export interface Reminder {
  id: string;
  bookmarkId: string;
  remindAt: Date;
  note?: string;
  createdAt: Date;
  triggered: boolean;
}

export interface ReminderStore {
  add(reminder: Reminder): Promise<Reminder>;
  getById(id: string): Promise<Reminder | undefined>;
  getAll(): Promise<Reminder[]>;
  getPending(now?: Date): Promise<Reminder[]>;
  markTriggered(id: string): Promise<Reminder | undefined>;
  remove(id: string): Promise<boolean>;
}

export interface ReminderService {
  schedule(bookmarkId: string, remindAt: Date, note?: string): Promise<Reminder>;
  getPending(now?: Date): Promise<Reminder[]>;
  getAll(): Promise<Reminder[]>;
  dismiss(id: string): Promise<Reminder | undefined>;
  cancel(id: string): Promise<boolean>;
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function createInMemoryReminderStore(): ReminderStore {
  const store = new Map<string, Reminder>();

  return {
    async add(reminder) {
      store.set(reminder.id, reminder);
      return reminder;
    },
    async getById(id) {
      return store.get(id);
    },
    async getAll() {
      return Array.from(store.values());
    },
    async getPending(now = new Date()) {
      return Array.from(store.values()).filter(
        (r) => !r.triggered && r.remindAt <= now
      );
    },
    async markTriggered(id) {
      const reminder = store.get(id);
      if (!reminder) return undefined;
      const updated = { ...reminder, triggered: true };
      store.set(id, updated);
      return updated;
    },
    async remove(id) {
      return store.delete(id);
    },
  };
}

export function createReminderService(
  reminderStore: ReminderStore
): ReminderService {
  return {
    async schedule(bookmarkId, remindAt, note) {
      const reminder: Reminder = {
        id: generateId(),
        bookmarkId,
        remindAt,
        note,
        createdAt: new Date(),
        triggered: false,
      };
      return reminderStore.add(reminder);
    },
    async getPending(now) {
      return reminderStore.getPending(now);
    },
    async getAll() {
      return reminderStore.getAll();
    },
    async dismiss(id) {
      return reminderStore.markTriggered(id);
    },
    async cancel(id) {
      return reminderStore.remove(id);
    },
  };
}

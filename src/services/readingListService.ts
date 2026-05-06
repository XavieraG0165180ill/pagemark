import { Bookmark } from "../models/bookmark";

export interface ReadingListEntry {
  bookmarkId: string;
  addedAt: string;
  readAt?: string;
}

export interface ReadingListStore {
  add(entry: ReadingListEntry): Promise<void>;
  remove(bookmarkId: string): Promise<void>;
  markRead(bookmarkId: string): Promise<void>;
  getAll(): Promise<ReadingListEntry[]>
  getUnread(): Promise<ReadingListEntry[]>;
  getByBookmarkId(bookmarkId: string): Promise<ReadingListEntry | undefined>;
}

export function createInMemoryReadingListStore(): ReadingListStore {
  const entries = new Map<string, ReadingListEntry>();

  return {
    async add(entry) {
      entries.set(entry.bookmarkId, entry);
    },
    async remove(bookmarkId) {
      entries.delete(bookmarkId);
    },
    async markRead(bookmarkId) {
      const entry = entries.get(bookmarkId);
      if (entry) {
        entries.set(bookmarkId, { ...entry, readAt: new Date().toISOString() });
      }
    },
    async getAll() {
      return Array.from(entries.values());
    },
    async getUnread() {
      return Array.from(entries.values()).filter((e) => !e.readAt);
    },
    async getByBookmarkId(bookmarkId) {
      return entries.get(bookmarkId);
    },
  };
}

export interface ReadingListService {
  addToList(bookmarkId: string): Promise<ReadingListEntry>;
  removeFromList(bookmarkId: string): Promise<void>;
  markAsRead(bookmarkId: string): Promise<ReadingListEntry>;
  getList(): Promise<ReadingListEntry[]>;
  getUnread(): Promise<ReadingListEntry[]>;
}

export function createReadingListService(
  store: ReadingListStore,
  getBookmarkById: (id: string) => Promise<Bookmark | undefined>
): ReadingListService {
  return {
    async addToList(bookmarkId) {
      const bookmark = await getBookmarkById(bookmarkId);
      if (!bookmark) throw new Error(`Bookmark not found: ${bookmarkId}`);
      const existing = await store.getByBookmarkId(bookmarkId);
      if (existing) return existing;
      const entry: ReadingListEntry = {
        bookmarkId,
        addedAt: new Date().toISOString(),
      };
      await store.add(entry);
      return entry;
    },
    async removeFromList(bookmarkId) {
      await store.remove(bookmarkId);
    },
    async markAsRead(bookmarkId) {
      const entry = await store.getByBookmarkId(bookmarkId);
      if (!entry) throw new Error(`Bookmark not in reading list: ${bookmarkId}`);
      await store.markRead(bookmarkId);
      return { ...entry, readAt: new Date().toISOString() };
    },
    async getList() {
      return store.getAll();
    },
    async getUnread() {
      return store.getUnread();
    },
  };
}

import { Bookmark } from "../models/bookmark";

export type ArchiveStatus = "pending" | "archived" | "failed";

export interface ArchiveRecord {
  bookmarkId: string;
  url: string;
  status: ArchiveStatus;
  archivedAt?: string;
  errorMessage?: string;
  snapshotUrl?: string;
}

export interface ArchiveStore {
  set(bookmarkId: string, record: ArchiveRecord): void;
  get(bookmarkId: string): ArchiveRecord | undefined;
  getAll(): ArchiveRecord[];
  delete(bookmarkId: string): void;
}

export function createInMemoryArchiveStore(): ArchiveStore {
  const store = new Map<string, ArchiveRecord>();
  return {
    set(bookmarkId, record) {
      store.set(bookmarkId, record);
    },
    get(bookmarkId) {
      return store.get(bookmarkId);
    },
    getAll() {
      return Array.from(store.values());
    },
    delete(bookmarkId) {
      store.delete(bookmarkId);
    },
  };
}

export interface ArchiveService {
  requestArchive(bookmark: Bookmark): ArchiveRecord;
  getStatus(bookmarkId: string): ArchiveRecord | undefined;
  markArchived(bookmarkId: string, snapshotUrl: string): ArchiveRecord | undefined;
  markFailed(bookmarkId: string, errorMessage: string): ArchiveRecord | undefined;
  listAll(): ArchiveRecord[];
  remove(bookmarkId: string): void;
}

export function createArchiveService(store: ArchiveStore): ArchiveService {
  return {
    requestArchive(bookmark) {
      const record: ArchiveRecord = {
        bookmarkId: bookmark.id,
        url: bookmark.url,
        status: "pending",
      };
      store.set(bookmark.id, record);
      return record;
    },

    getStatus(bookmarkId) {
      return store.get(bookmarkId);
    },

    markArchived(bookmarkId, snapshotUrl) {
      const record = store.get(bookmarkId);
      if (!record) return undefined;
      const updated: ArchiveRecord = {
        ...record,
        status: "archived",
        archivedAt: new Date().toISOString(),
        snapshotUrl,
      };
      store.set(bookmarkId, updated);
      return updated;
    },

    markFailed(bookmarkId, errorMessage) {
      const record = store.get(bookmarkId);
      if (!record) return undefined;
      const updated: ArchiveRecord = {
        ...record,
        status: "failed",
        errorMessage,
      };
      store.set(bookmarkId, updated);
      return updated;
    },

    listAll() {
      return store.getAll();
    },

    remove(bookmarkId) {
      store.delete(bookmarkId);
    },
  };
}

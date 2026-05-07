import { Bookmark } from "../models/bookmark";

export interface PinnedStore {
  add(bookmarkId: string): void;
  remove(bookmarkId: string): void;
  getAll(): string[];
  has(bookmarkId: string): boolean;
  reorder(orderedIds: string[]): void;
}

export interface PinnedService {
  pin(bookmarkId: string): void;
  unpin(bookmarkId: string): void;
  isPinned(bookmarkId: string): boolean;
  getPinnedIds(): string[];
  getPinnedBookmarks(getById: (id: string) => Bookmark | undefined): Bookmark[];
  reorder(orderedIds: string[]): void;
}

export function createInMemoryPinnedStore(): PinnedStore {
  const order: string[] = [];

  return {
    add(bookmarkId) {
      if (!order.includes(bookmarkId)) {
        order.push(bookmarkId);
      }
    },
    remove(bookmarkId) {
      const idx = order.indexOf(bookmarkId);
      if (idx !== -1) order.splice(idx, 1);
    },
    getAll() {
      return [...order];
    },
    has(bookmarkId) {
      return order.includes(bookmarkId);
    },
    reorder(orderedIds) {
      order.length = 0;
      order.push(...orderedIds);
    },
  };
}

export function createPinnedService(store: PinnedStore): PinnedService {
  return {
    pin(bookmarkId) {
      store.add(bookmarkId);
    },
    unpin(bookmarkId) {
      store.remove(bookmarkId);
    },
    isPinned(bookmarkId) {
      return store.has(bookmarkId);
    },
    getPinnedIds() {
      return store.getAll();
    },
    getPinnedBookmarks(getById) {
      return store
        .getAll()
        .map((id) => getById(id))
        .filter((b): b is Bookmark => b !== undefined);
    },
    reorder(orderedIds) {
      const current = new Set(store.getAll());
      const valid = orderedIds.filter((id) => current.has(id));
      store.reorder(valid);
    },
  };
}

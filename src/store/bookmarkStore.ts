import { Bookmark, createBookmark, updateBookmark } from '../models/bookmark';

export interface BookmarkStore {
  add(data: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>): Bookmark;
  getById(id: string): Bookmark | undefined;
  getAll(): Bookmark[];
  getByTag(tag: string): Bookmark[];
  update(id: string, data: Partial<Omit<Bookmark, 'id' | 'createdAt'>>): Bookmark | undefined;
  remove(id: string): boolean;
  search(query: string): Bookmark[];
}

export function createInMemoryBookmarkStore(): BookmarkStore {
  const store = new Map<string, Bookmark>();

  function add(data: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>): Bookmark {
    const bookmark = createBookmark(data);
    store.set(bookmark.id, bookmark);
    return bookmark;
  }

  function getById(id: string): Bookmark | undefined {
    return store.get(id);
  }

  function getAll(): Bookmark[] {
    return Array.from(store.values());
  }

  function getByTag(tag: string): Bookmark[] {
    const normalized = tag.toLowerCase().trim();
    return getAll().filter((b) => b.tags.map((t) => t.toLowerCase()).includes(normalized));
  }

  function update(id: string, data: Partial<Omit<Bookmark, 'id' | 'createdAt'>>): Bookmark | undefined {
    const existing = store.get(id);
    if (!existing) return undefined;
    const updated = updateBookmark(existing, data);
    store.set(id, updated);
    return updated;
  }

  function remove(id: string): boolean {
    return store.delete(id);
  }

  function search(query: string): Bookmark[] {
    const q = query.toLowerCase().trim();
    if (!q) return getAll();
    return getAll().filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.url.toLowerCase().includes(q) ||
        (b.description ?? '').toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return { add, getById, getAll, getByTag, update, remove, search };
}

export interface BookmarkVersion {
  id: string;
  bookmarkId: string;
  title: string;
  url: string;
  description?: string;
  tags: string[];
  savedAt: string;
  version: number;
}

export interface BookmarkVersionStore {
  save(version: BookmarkVersion): void;
  getByBookmarkId(bookmarkId: string): BookmarkVersion[];
  getLatest(bookmarkId: string): BookmarkVersion | undefined;
}

function generateVersionId(): string {
  return `ver_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createInMemoryBookmarkVersionStore(): BookmarkVersionStore {
  const store = new Map<string, BookmarkVersion[]>();

  return {
    save(version: BookmarkVersion): void {
      const existing = store.get(version.bookmarkId) ?? [];
      store.set(version.bookmarkId, [...existing, version]);
    },
    getByBookmarkId(bookmarkId: string): BookmarkVersion[] {
      return store.get(bookmarkId) ?? [];
    },
    getLatest(bookmarkId: string): BookmarkVersion | undefined {
      const versions = store.get(bookmarkId) ?? [];
      return versions[versions.length - 1];
    },
  };
}

export interface BookmarkVersionService {
  snapshot(bookmark: { id: string; title: string; url: string; description?: string; tags: string[] }): BookmarkVersion;
  getHistory(bookmarkId: string): BookmarkVersion[];
  getLatest(bookmarkId: string): BookmarkVersion | undefined;
}

export function createBookmarkVersionService(
  store: BookmarkVersionStore
): BookmarkVersionService {
  return {
    snapshot(bookmark): BookmarkVersion {
      const existing = store.getByBookmarkId(bookmark.id);
      const version: BookmarkVersion = {
        id: generateVersionId(),
        bookmarkId: bookmark.id,
        title: bookmark.title,
        url: bookmark.url,
        description: bookmark.description,
        tags: [...bookmark.tags],
        savedAt: new Date().toISOString(),
        version: existing.length + 1,
      };
      store.save(version);
      return version;
    },
    getHistory(bookmarkId: string): BookmarkVersion[] {
      return store.getByBookmarkId(bookmarkId);
    },
    getLatest(bookmarkId: string): BookmarkVersion | undefined {
      return store.getLatest(bookmarkId);
    },
  };
}

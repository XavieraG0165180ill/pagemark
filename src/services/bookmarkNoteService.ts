export interface BookmarkNote {
  id: string;
  bookmarkId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookmarkNoteStore {
  getByBookmarkId(bookmarkId: string): BookmarkNote | undefined;
  set(note: BookmarkNote): void;
  delete(bookmarkId: string): boolean;
  getAll(): BookmarkNote[];
}

export function createInMemoryBookmarkNoteStore(): BookmarkNoteStore {
  const notes = new Map<string, BookmarkNote>();

  return {
    getByBookmarkId(bookmarkId) {
      return notes.get(bookmarkId);
    },
    set(note) {
      notes.set(note.bookmarkId, note);
    },
    delete(bookmarkId) {
      return notes.delete(bookmarkId);
    },
    getAll() {
      return Array.from(notes.values());
    },
  };
}

export interface BookmarkNoteService {
  upsert(bookmarkId: string, content: string): BookmarkNote;
  get(bookmarkId: string): BookmarkNote | undefined;
  delete(bookmarkId: string): boolean;
  getAll(): BookmarkNote[];
}

export function createBookmarkNoteService(
  store: BookmarkNoteStore
): BookmarkNoteService {
  return {
    upsert(bookmarkId, content) {
      const existing = store.getByBookmarkId(bookmarkId);
      const now = new Date().toISOString();
      const note: BookmarkNote = {
        id: existing?.id ?? `note-${bookmarkId}`,
        bookmarkId,
        content,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      store.set(note);
      return note;
    },
    get(bookmarkId) {
      return store.getByBookmarkId(bookmarkId);
    },
    delete(bookmarkId) {
      return store.delete(bookmarkId);
    },
    getAll() {
      return store.getAll();
    },
  };
}

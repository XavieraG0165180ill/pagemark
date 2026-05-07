export interface BookmarkNote {
  bookmarkId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookmarkNoteStore {
  get(bookmarkId: string): BookmarkNote | undefined;
  set(bookmarkId: string, note: BookmarkNote): void;
  delete(bookmarkId: string): boolean;
  getAll(): BookmarkNote[];
}

export function createInMemoryBookmarkNoteStore(): BookmarkNoteStore {
  const notes = new Map<string, BookmarkNote>();

  return {
    get(bookmarkId) {
      return notes.get(bookmarkId);
    },
    set(bookmarkId, note) {
      notes.set(bookmarkId, note);
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
  getNote(bookmarkId: string): BookmarkNote | undefined;
  upsertNote(bookmarkId: string, content: string): BookmarkNote;
  deleteNote(bookmarkId: string): boolean;
  getAllNotes(): BookmarkNote[];
}

export function createBookmarkNoteService(
  store: BookmarkNoteStore
): BookmarkNoteService {
  return {
    getNote(bookmarkId) {
      return store.get(bookmarkId);
    },

    upsertNote(bookmarkId, content) {
      const now = new Date().toISOString();
      const existing = store.get(bookmarkId);
      const note: BookmarkNote = {
        bookmarkId,
        content,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      store.set(bookmarkId, note);
      return note;
    },

    deleteNote(bookmarkId) {
      return store.delete(bookmarkId);
    },

    getAllNotes() {
      return store.getAll();
    },
  };
}

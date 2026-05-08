export interface BookmarkNote {
  id: string;
  bookmarkId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNoteInput {
  bookmarkId: string;
  content: string;
}

export interface UpdateNoteInput {
  content: string;
}

export interface BookmarkNoteStore {
  save(note: BookmarkNote): Promise<void>;
  getByBookmarkId(bookmarkId: string): Promise<BookmarkNote | undefined>;
  delete(bookmarkId: string): Promise<void>;
  getAll(): Promise<BookmarkNote[]>;
}

export interface BookmarkNoteService {
  upsert(input: CreateNoteInput): Promise<BookmarkNote>;
  getByBookmarkId(bookmarkId: string): Promise<BookmarkNote | undefined>;
  update(bookmarkId: string, input: UpdateNoteInput): Promise<BookmarkNote | null>;
  delete(bookmarkId: string): Promise<boolean>;
  getAll(): Promise<BookmarkNote[]>;
}

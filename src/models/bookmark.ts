import { nanoid } from 'nanoid';

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  description?: string;
  tags: string[];
  collectionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookmarkInput {
  title: string;
  url: string;
  description?: string;
  tags?: string[];
  collectionId?: string;
}

export interface UpdateBookmarkInput {
  title?: string;
  url?: string;
  description?: string;
  tags?: string[];
  collectionId?: string;
}

export function createBookmark(input: CreateBookmarkInput): Bookmark {
  const now = new Date();
  return {
    id: nanoid(),
    title: input.title.trim(),
    url: input.url.trim(),
    description: input.description?.trim(),
    tags: input.tags ?? [],
    collectionId: input.collectionId,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateBookmark(
  bookmark: Bookmark,
  input: UpdateBookmarkInput
): Bookmark {
  return {
    ...bookmark,
    title: input.title !== undefined ? input.title.trim() : bookmark.title,
    url: input.url !== undefined ? input.url.trim() : bookmark.url,
    description:
      input.description !== undefined
        ? input.description.trim()
        : bookmark.description,
    tags: input.tags !== undefined ? input.tags : bookmark.tags,
    collectionId:
      input.collectionId !== undefined
        ? input.collectionId
        : bookmark.collectionId,
    updatedAt: new Date(),
  };
}

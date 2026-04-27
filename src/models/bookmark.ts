import { randomUUID } from 'crypto';

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description?: string;
  tags: string[];
  favicon?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateBookmarkInput = Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateBookmarkInput = Partial<Omit<Bookmark, 'id' | 'createdAt'>>;

export function createBookmark(input: CreateBookmarkInput): Bookmark {
  if (!input.url || !input.url.trim()) {
    throw new Error('Bookmark URL is required');
  }
  if (!input.title || !input.title.trim()) {
    throw new Error('Bookmark title is required');
  }

  const now = new Date();
  return {
    id: randomUUID(),
    url: input.url.trim(),
    title: input.title.trim(),
    description: input.description?.trim(),
    tags: input.tags.map((t) => t.toLowerCase().trim()).filter(Boolean),
    favicon: input.favicon,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateBookmark(bookmark: Bookmark, input: UpdateBookmarkInput): Bookmark {
  const tags = input.tags
    ? input.tags.map((t) => t.toLowerCase().trim()).filter(Boolean)
    : bookmark.tags;

  return {
    ...bookmark,
    url: input.url?.trim() ?? bookmark.url,
    title: input.title?.trim() ?? bookmark.title,
    description: input.description !== undefined ? input.description?.trim() : bookmark.description,
    tags,
    favicon: input.favicon !== undefined ? input.favicon : bookmark.favicon,
    updatedAt: new Date(),
  };
}

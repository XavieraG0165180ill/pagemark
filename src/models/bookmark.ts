export interface Bookmark {
  id: string;
  url: string;
  title: string;
  description?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  favicon?: string;
  fullText?: string;
}

export interface CreateBookmarkInput {
  url: string;
  title: string;
  description?: string;
  tags?: string[];
  favicon?: string;
  fullText?: string;
}

export interface UpdateBookmarkInput {
  title?: string;
  description?: string;
  tags?: string[];
  favicon?: string;
  fullText?: string;
}

export function createBookmark(input: CreateBookmarkInput): Bookmark {
  const now = new Date();
  return {
    id: crypto.randomUUID(),
    url: input.url,
    title: input.title,
    description: input.description,
    tags: input.tags ?? [],
    createdAt: now,
    updatedAt: now,
    favicon: input.favicon,
    fullText: input.fullText,
  };
}

export function updateBookmark(
  bookmark: Bookmark,
  input: UpdateBookmarkInput
): Bookmark {
  return {
    ...bookmark,
    ...Object.fromEntries(
      Object.entries(input).filter(([, v]) => v !== undefined)
    ),
    updatedAt: new Date(),
  };
}

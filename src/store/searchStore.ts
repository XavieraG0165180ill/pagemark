import { Bookmark } from '../models/bookmark';
import { InMemoryBookmarkStore } from './bookmarkStore';

export interface SearchOptions {
  query?: string;
  tags?: string[];
  collectionId?: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  bookmarks: Bookmark[];
  total: number;
}

export interface SearchStore {
  search(options: SearchOptions): Promise<SearchResult>;
}

function matchesQuery(bookmark: Bookmark, query: string): boolean {
  const q = query.toLowerCase();
  return (
    bookmark.title.toLowerCase().includes(q) ||
    bookmark.url.toLowerCase().includes(q) ||
    (bookmark.description?.toLowerCase().includes(q) ?? false)
  );
}

function matchesTags(bookmark: Bookmark, tags: string[]): boolean {
  return tags.every((tag) => bookmark.tags.includes(tag));
}

export function createInMemorySearchStore(
  bookmarkStore: InMemoryBookmarkStore
): SearchStore {
  return {
    async search(options: SearchOptions): Promise<SearchResult> {
      const { query, tags, collectionId, limit = 20, offset = 0 } = options;

      let results = await bookmarkStore.getAll();

      if (query && query.trim().length > 0) {
        results = results.filter((b) => matchesQuery(b, query.trim()));
      }

      if (tags && tags.length > 0) {
        results = results.filter((b) => matchesTags(b, tags));
      }

      if (collectionId) {
        results = results.filter((b) => b.collectionId === collectionId);
      }

      const total = results.length;
      const bookmarks = results.slice(offset, offset + limit);

      return { bookmarks, total };
    },
  };
}

export type InMemorySearchStore = ReturnType<typeof createInMemorySearchStore>;

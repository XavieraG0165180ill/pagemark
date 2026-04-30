import { createInMemorySearchStore } from "../store/searchStore";
import { createInMemoryBookmarkStore } from "../store/bookmarkStore";
import { Bookmark } from "../models/bookmark";

export interface SearchQuery {
  q?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface SearchResult {
  bookmarks: Bookmark[];
  total: number;
  page: number;
  limit: number;
}

export interface SearchService {
  search(query: SearchQuery): Promise<SearchResult>;
}

export function createSearchService(
  bookmarkStore: ReturnType<typeof createInMemoryBookmarkStore>,
  searchStore: ReturnType<typeof createInMemorySearchStore>
): SearchService {
  async function search(query: SearchQuery): Promise<SearchResult> {
    const { q, tags = [], page = 1, limit = 20 } = query;

    const allBookmarks = await bookmarkStore.getAll();

    const filtered = allBookmarks.filter((bookmark) => {
      const matchesText = q ? searchStore.matchesQuery(bookmark, q) : true;
      const matchesTags =
        tags.length > 0 ? searchStore.matchesTags(bookmark, tags) : true;
      return matchesText && matchesTags;
    });

    const total = filtered.length;
    const start = (page - 1) * limit;
    const bookmarks = filtered.slice(start, start + limit);

    return { bookmarks, total, page, limit };
  }

  return { search };
}

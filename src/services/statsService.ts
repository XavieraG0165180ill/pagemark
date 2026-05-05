import { BookmarkStore } from "../store/bookmarkStore";
import { TagStore } from "../store/tagStore";
import { CollectionStore } from "../store/collectionStore";

export interface BookmarkStats {
  totalBookmarks: number;
  totalTags: number;
  totalCollections: number;
  topTags: Array<{ slug: string; name: string; count: number }>;
  recentBookmarks: Array<{ id: string; title: string; url: string; createdAt: string }>;
  bookmarksPerDay: Record<string, number>;
}

export interface StatsService {
  getStats(): Promise<BookmarkStats>;
}

export function createStatsService(
  bookmarkStore: BookmarkStore,
  tagStore: TagStore,
  collectionStore: CollectionStore
): StatsService {
  async function getStats(): Promise<BookmarkStats> {
    const [bookmarks, tags, collections] = await Promise.all([
      bookmarkStore.getAll(),
      tagStore.getAll(),
      collectionStore.getAll(),
    ]);

    const topTags = [...tags]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(({ slug, name, count }) => ({ slug, name, count }));

    const recentBookmarks = [...bookmarks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(({ id, title, url, createdAt }) => ({ id, title, url, createdAt }));

    const bookmarksPerDay: Record<string, number> = {};
    for (const bookmark of bookmarks) {
      const day = bookmark.createdAt.slice(0, 10);
      bookmarksPerDay[day] = (bookmarksPerDay[day] ?? 0) + 1;
    }

    return {
      totalBookmarks: bookmarks.length,
      totalTags: tags.length,
      totalCollections: collections.length,
      topTags,
      recentBookmarks,
      bookmarksPerDay,
    };
  }

  return { getStats };
}

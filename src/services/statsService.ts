import { BookmarkStore } from "../store/bookmarkStore";
import { TagStore } from "../store/tagStore";
import { CollectionStore } from "../store/collectionStore";

export interface SiteStats {
  totalBookmarks: number;
  totalTags: number;
  totalCollections: number;
  topTags: Array<{ slug: string; label: string; count: number }>;
  recentBookmarks: Array<{ id: string; title: string; url: string; createdAt: string }>;
  bookmarksPerDay: Record<string, number>;
}

export interface StatsService {
  getSiteStats(): Promise<SiteStats>;
}

export function createStatsService(
  bookmarkStore: BookmarkStore,
  tagStore: TagStore,
  collectionStore: CollectionStore
): StatsService {
  async function getSiteStats(): Promise<SiteStats> {
    const [allBookmarks, allTags, allCollections] = await Promise.all([
      bookmarkStore.getAll(),
      tagStore.getAll(),
      collectionStore.getAll(),
    ]);

    const topTags = [...allTags]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(({ slug, label, count }) => ({ slug, label, count }));

    const recentBookmarks = [...allBookmarks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(({ id, title, url, createdAt }) => ({ id, title, url, createdAt }));

    const bookmarksPerDay: Record<string, number> = {};
    for (const bookmark of allBookmarks) {
      const day = bookmark.createdAt.slice(0, 10);
      bookmarksPerDay[day] = (bookmarksPerDay[day] ?? 0) + 1;
    }

    return {
      totalBookmarks: allBookmarks.length,
      totalTags: allTags.length,
      totalCollections: allCollections.length,
      topTags,
      recentBookmarks,
      bookmarksPerDay,
    };
  }

  return { getSiteStats };
}

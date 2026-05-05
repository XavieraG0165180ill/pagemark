import { describe, it, expect, beforeEach } from "vitest";
import { createInMemoryBookmarkStore } from "../store/bookmarkStore";
import { createInMemoryTagStore } from "../store/tagStore";
import { createInMemoryCollectionStore } from "../store/collectionStore";
import { createStatsService } from "./statsService";
import { createBookmark } from "../models/bookmark";
import { createTag } from "../models/tag";
import { createCollection } from "../models/collection";

function buildService() {
  const bookmarkStore = createInMemoryBookmarkStore();
  const tagStore = createInMemoryTagStore();
  const collectionStore = createInMemoryCollectionStore();
  const statsService = createStatsService(bookmarkStore, tagStore, collectionStore);
  return { bookmarkStore, tagStore, collectionStore, statsService };
}

describe("statsService", () => {
  it("returns zeros when stores are empty", async () => {
    const { statsService } = buildService();
    const stats = await statsService.getStats();
    expect(stats.totalBookmarks).toBe(0);
    expect(stats.totalTags).toBe(0);
    expect(stats.totalCollections).toBe(0);
    expect(stats.topTags).toHaveLength(0);
    expect(stats.recentBookmarks).toHaveLength(0);
    expect(stats.bookmarksPerDay).toEqual({});
  });

  it("counts bookmarks, tags, and collections", async () => {
    const { bookmarkStore, tagStore, collectionStore, statsService } = buildService();
    await bookmarkStore.add(createBookmark({ url: "https://a.com", title: "A" }));
    await bookmarkStore.add(createBookmark({ url: "https://b.com", title: "B" }));
    await tagStore.add(createTag("typescript"));
    await collectionStore.add(createCollection({ name: "Dev" }));
    const stats = await statsService.getStats();
    expect(stats.totalBookmarks).toBe(2);
    expect(stats.totalTags).toBe(1);
    expect(stats.totalCollections).toBe(1);
  });

  it("returns top tags sorted by count descending", async () => {
    const { tagStore, statsService } = buildService();
    const t1 = createTag("alpha");
    const t2 = createTag("beta");
    await tagStore.add({ ...t1, count: 5 });
    await tagStore.add({ ...t2, count: 12 });
    const stats = await statsService.getStats();
    expect(stats.topTags[0].slug).toBe("beta");
    expect(stats.topTags[1].slug).toBe("alpha");
  });

  it("returns at most 5 recent bookmarks sorted by createdAt desc", async () => {
    const { bookmarkStore, statsService } = buildService();
    for (let i = 1; i <= 7; i++) {
      await bookmarkStore.add(
        createBookmark({ url: `https://site${i}.com`, title: `Site ${i}` })
      );
    }
    const stats = await statsService.getStats();
    expect(stats.recentBookmarks).toHaveLength(5);
  });

  it("groups bookmarks by day", async () => {
    const { bookmarkStore, statsService } = buildService();
    const bm1 = createBookmark({ url: "https://x.com", title: "X" });
    const bm2 = createBookmark({ url: "https://y.com", title: "Y" });
    const day = bm1.createdAt.slice(0, 10);
    await bookmarkStore.add(bm1);
    await bookmarkStore.add(bm2);
    const stats = await statsService.getStats();
    expect(stats.bookmarksPerDay[day]).toBeGreaterThanOrEqual(2);
  });
});

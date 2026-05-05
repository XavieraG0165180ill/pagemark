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
    const stats = await statsService.getSiteStats();
    expect(stats.totalBookmarks).toBe(0);
    expect(stats.totalTags).toBe(0);
    expect(stats.totalCollections).toBe(0);
    expect(stats.topTags).toHaveLength(0);
    expect(stats.recentBookmarks).toHaveLength(0);
    expect(stats.bookmarksPerDay).toEqual({});
  });

  it("counts bookmarks, tags, and collections correctly", async () => {
    const { bookmarkStore, tagStore, collectionStore, statsService } = buildService();
    await bookmarkStore.add(createBookmark({ title: "A", url: "https://a.com", tags: [] }));
    await bookmarkStore.add(createBookmark({ title: "B", url: "https://b.com", tags: [] }));
    await tagStore.add(createTag("typescript"));
    await collectionStore.add(createCollection({ name: "Dev" }));
    const stats = await statsService.getSiteStats();
    expect(stats.totalBookmarks).toBe(2);
    expect(stats.totalTags).toBe(1);
    expect(stats.totalCollections).toBe(1);
  });

  it("returns top tags sorted by count descending", async () => {
    const { tagStore, statsService } = buildService();
    const t1 = createTag("alpha");
    const t2 = createTag("beta");
    t1.count = 5;
    t2.count = 12;
    await tagStore.add(t1);
    await tagStore.add(t2);
    const stats = await statsService.getSiteStats();
    expect(stats.topTags[0].slug).toBe("beta");
    expect(stats.topTags[1].slug).toBe("alpha");
  });

  it("returns at most 5 recent bookmarks", async () => {
    const { bookmarkStore, statsService } = buildService();
    for (let i = 0; i < 7; i++) {
      await bookmarkStore.add(createBookmark({ title: `B${i}`, url: `https://b${i}.com`, tags: [] }));
    }
    const stats = await statsService.getSiteStats();
    expect(stats.recentBookmarks.length).toBeLessThanOrEqual(5);
  });

  it("aggregates bookmarks per day", async () => {
    const { bookmarkStore, statsService } = buildService();
    const bm1 = createBookmark({ title: "X", url: "https://x.com", tags: [] });
    const bm2 = createBookmark({ title: "Y", url: "https://y.com", tags: [] });
    bm1.createdAt = "2024-06-01T10:00:00.000Z";
    bm2.createdAt = "2024-06-01T18:00:00.000Z";
    await bookmarkStore.add(bm1);
    await bookmarkStore.add(bm2);
    const stats = await statsService.getSiteStats();
    expect(stats.bookmarksPerDay["2024-06-01"]).toBe(2);
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { createDuplicateService, BookmarkStoreForDuplicates } from "./duplicateService";
import { Bookmark } from "../models/bookmark";

function makeBookmark(id: string, url: string): Bookmark {
  return {
    id,
    url,
    title: `Bookmark ${id}`,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function buildService(bookmarks: Bookmark[]) {
  const store: Bookmark[] = [...bookmarks];
  const mockStore: BookmarkStoreForDuplicates = {
    getAll: async () => [...store],
    delete: async (id: string) => {
      const idx = store.findIndex((b) => b.id === id);
      if (idx !== -1) store.splice(idx, 1);
    },
  };
  return { service: createDuplicateService(mockStore), store };
}

describe("duplicateService", () => {
  it("returns empty report when no duplicates", async () => {
    const { service } = buildService([
      makeBookmark("1", "https://example.com"),
      makeBookmark("2", "https://other.com"),
    ]);
    const report = await service.findDuplicates();
    expect(report.totalDuplicates).toBe(0);
    expect(report.groups).toHaveLength(0);
  });

  it("detects duplicate URLs", async () => {
    const { service } = buildService([
      makeBookmark("1", "https://example.com"),
      makeBookmark("2", "https://example.com/"),
      makeBookmark("3", "https://other.com"),
    ]);
    const report = await service.findDuplicates();
    expect(report.totalDuplicates).toBe(1);
    expect(report.groups).toHaveLength(1);
    expect(report.groups[0].bookmarks).toHaveLength(2);
  });

  it("merges duplicates keeping specified bookmark", async () => {
    const { service, store } = buildService([
      makeBookmark("1", "https://example.com"),
      makeBookmark("2", "https://example.com"),
      makeBookmark("3", "https://other.com"),
    ]);
    await service.mergeDuplicates("https://example.com", "1");
    expect(store.find((b) => b.id === "1")).toBeDefined();
    expect(store.find((b) => b.id === "2")).toBeUndefined();
    expect(store.find((b) => b.id === "3")).toBeDefined();
  });

  it("does nothing when no duplicates for given url", async () => {
    const { service, store } = buildService([
      makeBookmark("1", "https://example.com"),
    ]);
    await service.mergeDuplicates("https://example.com", "1");
    expect(store).toHaveLength(1);
  });
});

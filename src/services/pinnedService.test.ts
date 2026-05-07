import { describe, it, expect, beforeEach } from "vitest";
import {
  createInMemoryPinnedStore,
  createPinnedService,
  PinnedService,
} from "./pinnedService";
import { Bookmark } from "../models/bookmark";

function makeBookmark(id: string): Bookmark {
  return {
    id,
    url: `https://example.com/${id}`,
    title: `Bookmark ${id}`,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function buildService() {
  const store = createInMemoryPinnedStore();
  const service = createPinnedService(store);
  return { service };
}

describe("pinnedService", () => {
  let service: PinnedService;

  beforeEach(() => {
    ({ service } = buildService());
  });

  it("pins a bookmark", () => {
    service.pin("a");
    expect(service.isPinned("a")).toBe(true);
  });

  it("unpins a bookmark", () => {
    service.pin("a");
    service.unpin("a");
    expect(service.isPinned("a")).toBe(false);
  });

  it("does not duplicate pins", () => {
    service.pin("a");
    service.pin("a");
    expect(service.getPinnedIds()).toHaveLength(1);
  });

  it("returns pinned ids in insertion order", () => {
    service.pin("a");
    service.pin("b");
    service.pin("c");
    expect(service.getPinnedIds()).toEqual(["a", "b", "c"]);
  });

  it("reorders pinned bookmarks", () => {
    service.pin("a");
    service.pin("b");
    service.pin("c");
    service.reorder(["c", "a", "b"]);
    expect(service.getPinnedIds()).toEqual(["c", "a", "b"]);
  });

  it("ignores unknown ids during reorder", () => {
    service.pin("a");
    service.pin("b");
    service.reorder(["b", "x", "a"]);
    expect(service.getPinnedIds()).toEqual(["b", "a"]);
  });

  it("returns resolved bookmarks via getPinnedBookmarks", () => {
    const bm = makeBookmark("a");
    service.pin("a");
    const results = service.getPinnedBookmarks((id) =>
      id === "a" ? bm : undefined
    );
    expect(results).toEqual([bm]);
  });

  it("skips missing bookmarks in getPinnedBookmarks", () => {
    service.pin("a");
    service.pin("missing");
    const results = service.getPinnedBookmarks((id) =>
      id === "a" ? makeBookmark("a") : undefined
    );
    expect(results).toHaveLength(1);
  });
});

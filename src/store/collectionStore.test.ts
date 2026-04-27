import { describe, it, expect, beforeEach } from "vitest";
import { createInMemoryCollectionStore, CollectionStore } from "./collectionStore";

describe("collectionStore", () => {
  let store: CollectionStore;

  beforeEach(() => {
    store = createInMemoryCollectionStore();
  });

  describe("create", () => {
    it("creates and stores a collection", () => {
      const col = store.create({ name: "My Bookmarks" });
      expect(col.name).toBe("My Bookmarks");
      expect(store.getById(col.id)).toEqual(col);
    });

    it("stores multiple collections", () => {
      store.create({ name: "First" });
      store.create({ name: "Second" });
      expect(store.getAll()).toHaveLength(2);
    });
  });

  describe("getAll", () => {
    it("returns collections sorted by createdAt descending", async () => {
      store.create({ name: "Older" });
      await new Promise((r) => setTimeout(r, 5));
      store.create({ name: "Newer" });
      const all = store.getAll();
      expect(all[0].name).toBe("Newer");
      expect(all[1].name).toBe("Older");
    });
  });

  describe("getBySlug", () => {
    it("finds a collection by slug", () => {
      store.create({ name: "Dev Tools" });
      const found = store.getBySlug("dev-tools");
      expect(found).toBeDefined();
      expect(found?.name).toBe("Dev Tools");
    });

    it("returns undefined for unknown slug", () => {
      expect(store.getBySlug("nope")).toBeUndefined();
    });
  });

  describe("update", () => {
    it("updates an existing collection", () => {
      const col = store.create({ name: "Old Name" });
      const updated = store.update(col.id, { name: "New Name" });
      expect(updated.name).toBe("New Name");
      expect(store.getById(col.id)?.name).toBe("New Name");
    });

    it("throws for unknown id", () => {
      expect(() => store.update("ghost", { name: "X" })).toThrow(
        "Collection not found: ghost"
      );
    });
  });

  describe("delete", () => {
    it("removes a collection", () => {
      const col = store.create({ name: "Temp" });
      expect(store.delete(col.id)).toBe(true);
      expect(store.getById(col.id)).toBeUndefined();
    });

    it("returns false for non-existent id", () => {
      expect(store.delete("missing")).toBe(false);
    });
  });

  describe("addBookmark / removeBookmark", () => {
    it("adds a bookmark to a collection", () => {
      const col = store.create({ name: "Reading" });
      const updated = store.addBookmark(col.id, "bm-42");
      expect(updated.bookmarkIds).toContain("bm-42");
    });

    it("removes a bookmark from a collection", () => {
      const col = store.create({ name: "Reading" });
      store.addBookmark(col.id, "bm-42");
      const updated = store.removeBookmark(col.id, "bm-42");
      expect(updated.bookmarkIds).not.toContain("bm-42");
    });

    it("throws addBookmark for unknown collection", () => {
      expect(() => store.addBookmark("ghost", "bm-1")).toThrow(
        "Collection not found: ghost"
      );
    });
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import {
  createCollection,
  updateCollection,
  addBookmarkToCollection,
  removeBookmarkFromCollection,
  type Collection,
} from "./collection";

describe("createCollection", () => {
  it("creates a collection with required fields", () => {
    const col = createCollection({ name: "Dev Resources" });
    expect(col.name).toBe("Dev Resources");
    expect(col.slug).toBe("dev-resources");
    expect(col.bookmarkIds).toEqual([]);
    expect(col.id).toBeDefined();
    expect(col.createdAt).toBeInstanceOf(Date);
    expect(col.updatedAt).toBeInstanceOf(Date);
  });

  it("creates a collection with description", () => {
    const col = createCollection({
      name: "Reading List",
      description: "Articles to read later",
    });
    expect(col.description).toBe("Articles to read later");
  });

  it("throws when name is empty", () => {
    expect(() => createCollection({ name: "" })).toThrow(
      "Collection name is required"
    );
  });

  it("throws when name is only whitespace", () => {
    expect(() => createCollection({ name: "   " })).toThrow(
      "Collection name is required"
    );
  });

  it("trims whitespace from name", () => {
    const col = createCollection({ name: "  My List  " });
    expect(col.name).toBe("My List");
  });

  it("uses provided id", () => {
    const col = createCollection({ name: "Test" }, "custom-id");
    expect(col.id).toBe("custom-id");
  });
});

describe("updateCollection", () => {
  let collection: Collection;

  beforeEach(() => {
    collection = createCollection({ name: "Original Name" }, "test-id");
  });

  it("updates the name and slug", () => {
    const updated = updateCollection(collection, { name: "New Name" });
    expect(updated.name).toBe("New Name");
    expect(updated.slug).toBe("new-name");
  });

  it("throws when updating with empty name", () => {
    expect(() => updateCollection(collection, { name: "" })).toThrow(
      "Collection name cannot be empty"
    );
  });

  it("updates bookmarkIds and deduplicates", () => {
    const updated = updateCollection(collection, {
      bookmarkIds: ["a", "b", "a"],
    });
    expect(updated.bookmarkIds).toEqual(["a", "b"]);
  });

  it("preserves unchanged fields", () => {
    const updated = updateCollection(collection, { description: "New desc" });
    expect(updated.id).toBe("test-id");
    expect(updated.name).toBe("Original Name");
  });

  it("updates updatedAt timestamp", () => {
    const updated = updateCollection(collection, { description: "Changed" });
    expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(
      collection.updatedAt.getTime()
    );
  });
});

describe("addBookmarkToCollection", () => {
  it("adds a bookmark id", () => {
    const col = createCollection({ name: "Test" });
    const updated = addBookmarkToCollection(col, "bm-1");
    expect(updated.bookmarkIds).toContain("bm-1");
  });

  it("does not duplicate bookmark ids", () => {
    const col = createCollection({ name: "Test" });
    const once = addBookmarkToCollection(col, "bm-1");
    const twice = addBookmarkToCollection(once, "bm-1");
    expect(twice.bookmarkIds.length).toBe(1);
  });
});

describe("removeBookmarkFromCollection", () => {
  it("removes a bookmark id", () => {
    const col = createCollection({ name: "Test" });
    const withBookmark = addBookmarkToCollection(col, "bm-1");
    const updated = removeBookmarkFromCollection(withBookmark, "bm-1");
    expect(updated.bookmarkIds).not.toContain("bm-1");
  });

  it("does nothing when bookmark id is not present", () => {
    const col = createCollection({ name: "Test" });
    const updated = removeBookmarkFromCollection(col, "bm-99");
    expect(updated.bookmarkIds).toEqual([]);
  });

  it("only removes the specified bookmark id", () => {
    const col = createCollection({ name: "Test" });
    const withBookmarks = addBookmarkToCollection(
      addBookmarkToCollection(col, "bm-1"),
      "bm-2"
    );
    const updated = removeBookmarkFromCollection(withBookmarks, "bm-1");
    expect(updated.bookmarkIds).toEqual(["bm-2"]);
  });
});

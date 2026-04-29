import { createBookmarkService } from "./bookmarkService";
import { createInMemoryBookmarkStore } from "../store/bookmarkStore";
import { createInMemoryTagStore } from "../store/tagStore";
import { createInMemorySearchStore } from "../store/searchStore";

function buildService() {
  const bookmarkStore = createInMemoryBookmarkStore();
  const tagStore = createInMemoryTagStore();
  const searchStore = createInMemorySearchStore();
  const service = createBookmarkService(bookmarkStore, tagStore, searchStore);
  return { service, bookmarkStore, tagStore, searchStore };
}

describe("bookmarkService", () => {
  it("adds a bookmark and indexes it", async () => {
    const { service } = buildService();
    const bookmark = await service.add({
      url: "https://example.com",
      title: "Example",
      tags: ["typescript", "web"],
    });
    expect(bookmark.id).toBeDefined();
    expect(bookmark.tags).toHaveLength(2);
  });

  it("creates tags when adding a bookmark", async () => {
    const { service, tagStore } = buildService();
    await service.add({
      url: "https://example.com",
      title: "Example",
      tags: ["typescript"],
    });
    const tag = await tagStore.getBySlug("typescript");
    expect(tag).not.toBeNull();
    expect(tag?.count).toBe(1);
  });

  it("increments tag count for duplicate tags", async () => {
    const { service, tagStore } = buildService();
    await service.add({ url: "https://a.com", title: "A", tags: ["shared"] });
    await service.add({ url: "https://b.com", title: "B", tags: ["shared"] });
    const tag = await tagStore.getBySlug("shared");
    expect(tag?.count).toBe(2);
  });

  it("updates a bookmark", async () => {
    const { service } = buildService();
    const bookmark = await service.add({ url: "https://example.com", title: "Old Title" });
    const updated = await service.update(bookmark.id, { title: "New Title" });
    expect(updated?.title).toBe("New Title");
  });

  it("returns null when updating non-existent bookmark", async () => {
    const { service } = buildService();
    const result = await service.update("nonexistent", { title: "X" });
    expect(result).toBeNull();
  });

  it("removes a bookmark and decrements tag counts", async () => {
    const { service, tagStore } = buildService();
    const bookmark = await service.add({ url: "https://example.com", title: "Test", tags: ["node"] });
    const removed = await service.remove(bookmark.id);
    expect(removed).toBe(true);
    const tag = await tagStore.getBySlug("node");
    expect(tag?.count).toBe(0);
  });

  it("returns false when removing non-existent bookmark", async () => {
    const { service } = buildService();
    const result = await service.remove("ghost");
    expect(result).toBe(false);
  });

  it("searches bookmarks by query", async () => {
    const { service } = buildService();
    await service.add({ url: "https://typescript.org", title: "TypeScript Docs" });
    await service.add({ url: "https://rust-lang.org", title: "Rust Lang" });
    const results = await service.search("TypeScript");
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe("TypeScript Docs");
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { createTagService } from "./tagService";
import { createInMemoryTagStore } from "../store/tagStore";
import { createInMemoryBookmarkStore } from "../store/bookmarkStore";
import { createTag } from "../models/tag";
import { createBookmark } from "../models/bookmark";

function buildService() {
  const tagStore = createInMemoryTagStore();
  const bookmarkStore = createInMemoryBookmarkStore();
  const service = createTagService(tagStore, bookmarkStore);
  return { service, tagStore, bookmarkStore };
}

describe("tagService", () => {
  let ctx: ReturnType<typeof buildService>;

  beforeEach(() => {
    ctx = buildService();
  });

  it("getOrCreate creates a new tag if not exists", async () => {
    const tag = await ctx.service.getOrCreate("TypeScript");
    expect(tag.name).toBe("typescript");
    expect(tag.slug).toBe("typescript");
  });

  it("getOrCreate returns existing tag", async () => {
    await ctx.service.getOrCreate("TypeScript");
    const tag = await ctx.service.getOrCreate("typescript");
    expect(tag.slug).toBe("typescript");
    const all = await ctx.service.getAll();
    expect(all).toHaveLength(1);
  });

  it("mergeInto reassigns bookmarks and removes source tag", async () => {
    const tagA = createTag("alpha");
    const tagB = createTag("beta");
    await ctx.tagStore.add(tagA);
    await ctx.tagStore.add(tagB);
    const bookmark = createBookmark({ url: "https://example.com", title: "Ex", tags: ["alpha"] });
    await ctx.bookmarkStore.add(bookmark);

    const result = await ctx.service.mergeInto("alpha", "beta");
    expect(result.slug).toBe("beta");

    const updated = await ctx.bookmarkStore.getById(bookmark.id);
    expect(updated?.tags).toContain("beta");
    expect(updated?.tags).not.toContain("alpha");

    const gone = await ctx.tagStore.getBySlug("alpha");
    expect(gone).toBeUndefined();
  });

  it("rename updates slug and bookmark references", async () => {
    const tag = createTag("old-name");
    await ctx.tagStore.add(tag);
    const bookmark = createBookmark({ url: "https://example.com", title: "Ex", tags: ["old-name"] });
    await ctx.bookmarkStore.add(bookmark);

    const renamed = await ctx.service.rename("old-name", "New Name");
    expect(renamed.slug).toBe("new-name");

    const updated = await ctx.bookmarkStore.getById(bookmark.id);
    expect(updated?.tags).toContain("new-name");
    expect(updated?.tags).not.toContain("old-name");
  });

  it("delete removes tag and cleans bookmark references", async () => {
    const tag = createTag("remove-me");
    await ctx.tagStore.add(tag);
    const bookmark = createBookmark({ url: "https://example.com", title: "Ex", tags: ["remove-me"] });
    await ctx.bookmarkStore.add(bookmark);

    await ctx.service.delete("remove-me");
    const gone = await ctx.tagStore.getBySlug("remove-me");
    expect(gone).toBeUndefined();

    const updated = await ctx.bookmarkStore.getById(bookmark.id);
    expect(updated?.tags).not.toContain("remove-me");
  });

  it("mergeInto throws if source tag not found", async () => {
    const tagB = createTag("beta");
    await ctx.tagStore.add(tagB);
    await expect(ctx.service.mergeInto("nonexistent", "beta")).rejects.toThrow("Tag not found");
  });
});

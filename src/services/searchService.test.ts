import { createInMemoryBookmarkStore } from "../store/bookmarkStore";
import { createInMemorySearchStore } from "../store/searchStore";
import { createBookmark } from "../models/bookmark";
import { createSearchService } from "./searchService";

function buildService() {
  const bookmarkStore = createInMemoryBookmarkStore();
  const searchStore = createInMemorySearchStore();
  const searchService = createSearchService(bookmarkStore, searchStore);
  return { bookmarkStore, searchService };
}

describe("searchService", () => {
  it("returns all bookmarks when no query or tags provided", async () => {
    const { bookmarkStore, searchService } = buildService();
    await bookmarkStore.add(createBookmark({ url: "https://a.com", title: "Alpha" }));
    await bookmarkStore.add(createBookmark({ url: "https://b.com", title: "Beta" }));

    const result = await searchService.search({});
    expect(result.total).toBe(2);
    expect(result.bookmarks).toHaveLength(2);
  });

  it("filters bookmarks by full-text query", async () => {
    const { bookmarkStore, searchService } = buildService();
    await bookmarkStore.add(createBookmark({ url: "https://typescript.org", title: "TypeScript Docs" }));
    await bookmarkStore.add(createBookmark({ url: "https://rust-lang.org", title: "Rust Language" }));

    const result = await searchService.search({ q: "typescript" });
    expect(result.total).toBe(1);
    expect(result.bookmarks[0].title).toBe("TypeScript Docs");
  });

  it("filters bookmarks by tags", async () => {
    const { bookmarkStore, searchService } = buildService();
    await bookmarkStore.add(createBookmark({ url: "https://a.com", title: "A", tags: ["dev", "js"] }));
    await bookmarkStore.add(createBookmark({ url: "https://b.com", title: "B", tags: ["design"] }));

    const result = await searchService.search({ tags: ["dev"] });
    expect(result.total).toBe(1);
    expect(result.bookmarks[0].title).toBe("A");
  });

  it("paginates results", async () => {
    const { bookmarkStore, searchService } = buildService();
    for (let i = 0; i < 5; i++) {
      await bookmarkStore.add(createBookmark({ url: `https://site${i}.com`, title: `Site ${i}` }));
    }

    const result = await searchService.search({ page: 2, limit: 2 });
    expect(result.page).toBe(2);
    expect(result.limit).toBe(2);
    expect(result.bookmarks).toHaveLength(2);
    expect(result.total).toBe(5);
  });

  it("returns empty when no bookmarks match", async () => {
    const { bookmarkStore, searchService } = buildService();
    await bookmarkStore.add(createBookmark({ url: "https://example.com", title: "Example" }));

    const result = await searchService.search({ q: "nonexistent" });
    expect(result.total).toBe(0);
    expect(result.bookmarks).toHaveLength(0);
  });
});

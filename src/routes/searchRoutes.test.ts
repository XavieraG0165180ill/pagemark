import Fastify from "fastify";
import { createInMemoryBookmarkStore } from "../store/bookmarkStore";
import { createInMemorySearchStore } from "../store/searchStore";
import { createSearchService } from "../services/searchService";
import { createSearchRouter } from "./searchRoutes";
import { createBookmark } from "../models/bookmark";

function buildApp() {
  const app = Fastify();
  const bookmarkStore = createInMemoryBookmarkStore();
  const searchStore = createInMemorySearchStore();
  const searchService = createSearchService({ bookmarkStore, searchStore });
  app.register(createSearchRouter(searchService));
  return { app, bookmarkStore, searchStore };
}

describe("GET /search", () => {
  it("returns empty array when no bookmarks match", async () => {
    const { app } = buildApp();
    const res = await app.inject({ method: "GET", url: "/search?q=nothing" });
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res.body)).toEqual([]);
  });

  it("returns 400 when query param is missing", async () => {
    const { app } = buildApp();
    const res = await app.inject({ method: "GET", url: "/search" });
    expect(res.statusCode).toBe(400);
  });

  it("returns matching bookmarks by title", async () => {
    const { app, bookmarkStore, searchStore } = buildApp();
    const bm = createBookmark({ url: "https://example.com", title: "TypeScript Guide", tags: [] });
    await bookmarkStore.add(bm);
    searchStore.index(bm);
    const res = await app.inject({ method: "GET", url: "/search?q=typescript" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe(bm.id);
  });

  it("filters by tag when tags param provided", async () => {
    const { app, bookmarkStore, searchStore } = buildApp();
    const bm1 = createBookmark({ url: "https://a.com", title: "Alpha", tags: ["dev"] });
    const bm2 = createBookmark({ url: "https://b.com", title: "Beta", tags: ["design"] });
    await bookmarkStore.add(bm1);
    await bookmarkStore.add(bm2);
    searchStore.index(bm1);
    searchStore.index(bm2);
    const res = await app.inject({ method: "GET", url: "/search?q=&tags=dev" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe(bm1.id);
  });

  it("returns 500 on service error", async () => {
    const app = Fastify();
    const brokenService = {
      search: async () => { throw new Error("db error"); }
    } as any;
    app.register(createSearchRouter(brokenService));
    const res = await app.inject({ method: "GET", url: "/search?q=test" });
    expect(res.statusCode).toBe(500);
  });
});

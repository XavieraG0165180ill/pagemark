import request from "supertest";
import express from "express";
import { createCollectionRouter } from "./collectionRoutes";
import { createInMemoryCollectionStore } from "../store/collectionStore";
import { createInMemoryBookmarkStore } from "../store/bookmarkStore";
import { createCollection } from "../models/collection";
import { createBookmark } from "../models/bookmark";

function buildApp() {
  const app = express();
  app.use(express.json());
  const collectionStore = createInMemoryCollectionStore();
  const bookmarkStore = createInMemoryBookmarkStore();
  app.use("/collections", createCollectionRouter(collectionStore, bookmarkStore));
  return { app, collectionStore, bookmarkStore };
}

describe("GET /collections", () => {
  it("returns empty array initially", async () => {
    const { app } = buildApp();
    const res = await request(app).get("/collections");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("returns existing collections", async () => {
    const { app, collectionStore } = buildApp();
    collectionStore.add(createCollection("Reading List"));
    const res = await request(app).get("/collections");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe("Reading List");
  });
});

describe("GET /collections/:slug", () => {
  it("returns 404 for unknown slug", async () => {
    const { app } = buildApp();
    const res = await request(app).get("/collections/nope");
    expect(res.status).toBe(404);
  });

  it("returns collection by slug", async () => {
    const { app, collectionStore } = buildApp();
    const col = createCollection("Dev Tools");
    collectionStore.add(col);
    const res = await request(app).get(`/collections/${col.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Dev Tools");
  });
});

describe("POST /collections", () => {
  it("creates a new collection", async () => {
    const { app } = buildApp();
    const res = await request(app).post("/collections").send({ name: "Favorites", description: "My favs" });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Favorites");
    expect(res.body.slug).toBe("favorites");
  });

  it("returns 400 when name is missing", async () => {
    const { app } = buildApp();
    const res = await request(app).post("/collections").send({});
    expect(res.status).toBe(400);
  });
});

describe("POST /collections/:slug/bookmarks/:bookmarkId", () => {
  it("adds a bookmark to a collection", async () => {
    const { app, collectionStore, bookmarkStore } = buildApp();
    const col = createCollection("Saved");
    collectionStore.add(col);
    const bm = createBookmark("https://example.com", "Example", []);
    bookmarkStore.add(bm);
    const res = await request(app).post(`/collections/${col.slug}/bookmarks/${bm.id}`);
    expect(res.status).toBe(200);
    expect(res.body.bookmarkIds).toContain(bm.id);
  });

  it("returns 404 when bookmark does not exist", async () => {
    const { app, collectionStore } = buildApp();
    const col = createCollection("Saved");
    collectionStore.add(col);
    const res = await request(app).post(`/collections/${col.slug}/bookmarks/nonexistent`);
    expect(res.status).toBe(404);
  });
});

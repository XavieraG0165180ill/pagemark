import Fastify from "fastify";
import express, { Express } from "express";
import request from "supertest";
import { createStatsRouter } from "./statsRoutes";
import { createStatsService } from "../services/statsService";
import { createInMemoryBookmarkStore } from "../store/bookmarkStore";
import { createInMemoryTagStore } from "../store/tagStore";
import { createInMemoryCollectionStore } from "../store/collectionStore";
import { createBookmark } from "../models/bookmark";
import { createTag } from "../models/tag";
import { createCollection } from "../models/collection";

function buildApp(): Express {
  const bookmarkStore = createInMemoryBookmarkStore();
  const tagStore = createInMemoryTagStore();
  const collectionStore = createInMemoryCollectionStore();
  const statsService = createStatsService(bookmarkStore, tagStore, collectionStore);

  const app = express();
  app.use(express.json());
  app.use("/stats", createStatsRouter(statsService));
  return app;
}

describe("GET /stats", () => {
  it("returns overall stats with zero counts on empty store", async () => {
    const app = buildApp();
    const res = await request(app).get("/stats");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      totalBookmarks: 0,
      totalTags: 0,
      totalCollections: 0,
    });
  });
});

describe("GET /stats/tags", () => {
  it("returns tag stats", async () => {
    const app = buildApp();
    const res = await request(app).get("/stats/tags");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("GET /stats/collections", () => {
  it("returns collection stats", async () => {
    const app = buildApp();
    const res = await request(app).get("/stats/collections");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("returns 200 with empty array when no collections exist", async () => {
    const app = buildApp();
    const res = await request(app).get("/stats/collections");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

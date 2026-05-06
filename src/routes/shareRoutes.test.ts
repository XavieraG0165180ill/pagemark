import { describe, it, expect, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import { createInMemoryShareStore, createShareService } from "../services/shareService";
import { createShareRouter } from "./shareRoutes";

function buildApp() {
  const shareStore = createInMemoryShareStore();
  let counter = 0;
  const shareService = createShareService({
    shareStore,
    generateId: () => `id-${counter++}`,
  });
  const app = express();
  app.use(express.json());
  app.use(createShareRouter(shareService));
  return { app, shareService };
}

describe("shareRoutes", () => {
  it("POST /bookmarks/:id/share creates a link", async () => {
    const { app } = buildApp();
    const res = await request(app).post("/bookmarks/bm-1/share").send({});
    expect(res.status).toBe(201);
    expect(res.body.bookmarkId).toBe("bm-1");
    expect(res.body.token).toBeTruthy();
  });

  it("POST /bookmarks/:id/share with expiresInDays sets expiry", async () => {
    const { app } = buildApp();
    const res = await request(app).post("/bookmarks/bm-2/share").send({ expiresInDays: 3 });
    expect(res.status).toBe(201);
    expect(res.body.expiresAt).not.toBeNull();
  });

  it("GET /bookmarks/:id/share lists links", async () => {
    const { app } = buildApp();
    await request(app).post("/bookmarks/bm-3/share").send({});
    await request(app).post("/bookmarks/bm-3/share").send({});
    const res = await request(app).get("/bookmarks/bm-3/share");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  it("GET /share/:token resolves a valid token", async () => {
    const { app } = buildApp();
    const created = await request(app).post("/bookmarks/bm-4/share").send({});
    const { token } = created.body;
    const res = await request(app).get(`/share/${token}`);
    expect(res.status).toBe(200);
    expect(res.body.viewCount).toBe(1);
  });

  it("GET /share/:token returns 404 for unknown token", async () => {
    const { app } = buildApp();
    const res = await request(app).get("/share/badtoken");
    expect(res.status).toBe(404);
  });

  it("DELETE /share/:id removes the link", async () => {
    const { app } = buildApp();
    const created = await request(app).post("/bookmarks/bm-5/share").send({});
    const { id, token } = created.body;
    await request(app).delete(`/share/${id}`);
    const res = await request(app).get(`/share/${token}`);
    expect(res.status).toBe(404);
  });
});

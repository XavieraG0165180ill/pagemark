import Fastify from "fastify";
import express, { Express } from "express";
import request from "supertest";
import { createTagRouter } from "./tagRoutes";
import { createInMemoryTagStore } from "../store/tagStore";
import { createTag } from "../models/tag";

function buildApp(): Express {
  const app = express();
  app.use(express.json());
  const tagStore = createInMemoryTagStore();

  // Pre-seed some tags
  const setup = async () => {
    await tagStore.add(createTag("TypeScript"));
    await tagStore.add(createTag("Open Source"));
  };
  // Attach store and setup to app for test access
  (app as any).__tagStore = tagStore;
  (app as any).__setup = setup;

  app.use("/tags", createTagRouter(tagStore));
  return app;
}

describe("GET /tags", () => {
  it("returns all tags", async () => {
    const app = buildApp();
    await (app as any).__setup();
    const res = await request(app).get("/tags");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });
});

describe("GET /tags/:slug", () => {
  it("returns a tag by slug", async () => {
    const app = buildApp();
    await (app as any).__setup();
    const res = await request(app).get("/tags/typescript");
    expect(res.status).toBe(200);
    expect(res.body.slug).toBe("typescript");
    expect(res.body.name).toBe("TypeScript");
  });

  it("returns 404 for unknown slug", async () => {
    const app = buildApp();
    await (app as any).__setup();
    const res = await request(app).get("/tags/nonexistent");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Tag not found");
  });
});

describe("DELETE /tags/:slug", () => {
  it("removes an existing tag", async () => {
    const app = buildApp();
    await (app as any).__setup();
    const del = await request(app).delete("/tags/typescript");
    expect(del.status).toBe(204);
    const get = await request(app).get("/tags/typescript");
    expect(get.status).toBe(404);
  });

  it("returns 404 when deleting a non-existent tag", async () => {
    const app = buildApp();
    await (app as any).__setup();
    const res = await request(app).delete("/tags/ghost");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Tag not found");
  });
});

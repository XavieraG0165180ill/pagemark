import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import { createImportExportRouter } from "./importExportRoutes";
import { createInMemoryBookmarkStore } from "../store/bookmarkStore";
import { createInMemoryTagStore } from "../store/tagStore";
import { createBookmark } from "../models/bookmark";
import { exportToJson } from "../services/importExport";

function buildApp() {
  const app = express();
  app.use(express.json());
  const bookmarkStore = createInMemoryBookmarkStore();
  const tagStore = createInMemoryTagStore();
  app.use("/", createImportExportRouter(bookmarkStore, tagStore));
  return { app, bookmarkStore, tagStore };
}

describe("GET /export/json", () => {
  it("returns JSON export", async () => {
    const { app } = buildApp();
    const res = await request(app).get("/export/json");
    expect(res.status).toBe(200);
    expect(res.body.version).toBe("1.0");
    expect(Array.isArray(res.body.bookmarks)).toBe(true);
  });
});

describe("GET /export/html", () => {
  it("returns Netscape HTML", async () => {
    const { app } = buildApp();
    const res = await request(app).get("/export/html");
    expect(res.status).toBe(200);
    expect(res.text).toContain("NETSCAPE-Bookmark-file-1");
  });
});

describe("POST /import/json", () => {
  it("imports bookmarks from JSON", async () => {
    const { app } = buildApp();
    const bookmark = createBookmark({ url: "https://example.com", title: "Example", tags: [] });
    const payload = exportToJson([bookmark], []);
    const res = await request(app).post("/import/json").send(payload);
    expect(res.status).toBe(200);
    expect(res.body.imported).toBe(1);
  });

  it("returns 400 on invalid payload", async () => {
    const { app } = buildApp();
    const res = await request(app).post("/import/json").send({ bad: true });
    expect(res.status).toBe(400);
  });
});

describe("POST /import/html", () => {
  it("imports bookmarks from Netscape HTML", async () => {
    const { app } = buildApp();
    const html = `<DL><p><DT><A HREF="https://example.com" TAGS="dev">Example</A></DL>`;
    const res = await request(app).post("/import/html").send({ html });
    expect(res.status).toBe(200);
    expect(res.body.imported).toBe(1);
  });

  it("returns 400 when html field is missing", async () => {
    const { app } = buildApp();
    const res = await request(app).post("/import/html").send({});
    expect(res.status).toBe(400);
  });
});

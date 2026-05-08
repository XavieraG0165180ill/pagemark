import express from "express";
import request from "supertest";
import { createBookmarkNoteRouter } from "./bookmarkNoteRoutes";
import {
  createInMemoryBookmarkNoteStore,
  createBookmarkNoteService,
} from "../services/bookmarkNoteService";

function buildApp() {
  const store = createInMemoryBookmarkNoteStore();
  const service = createBookmarkNoteService(store);
  const app = express();
  app.use(express.json());
  app.use("/notes", createBookmarkNoteRouter(service));
  return app;
}

describe("bookmarkNoteRoutes", () => {
  it("POST /:bookmarkId creates a note", async () => {
    const app = buildApp();
    const res = await request(app)
      .post("/notes/bm-1")
      .send({ content: "My note" });
    expect(res.status).toBe(201);
    expect(res.body.bookmarkId).toBe("bm-1");
    expect(res.body.content).toBe("My note");
  });

  it("POST /:bookmarkId returns 400 if content missing", async () => {
    const app = buildApp();
    const res = await request(app).post("/notes/bm-1").send({});
    expect(res.status).toBe(400);
  });

  it("GET /:bookmarkId returns note", async () => {
    const app = buildApp();
    await request(app).post("/notes/bm-2").send({ content: "Hello" });
    const res = await request(app).get("/notes/bm-2");
    expect(res.status).toBe(200);
    expect(res.body.content).toBe("Hello");
  });

  it("GET /:bookmarkId returns 404 if not found", async () => {
    const app = buildApp();
    const res = await request(app).get("/notes/missing");
    expect(res.status).toBe(404);
  });

  it("PUT /:bookmarkId updates note content", async () => {
    const app = buildApp();
    await request(app).post("/notes/bm-3").send({ content: "Original" });
    const res = await request(app)
      .put("/notes/bm-3")
      .send({ content: "Updated" });
    expect(res.status).toBe(200);
    expect(res.body.content).toBe("Updated");
  });

  it("PUT /:bookmarkId returns 404 if note does not exist", async () => {
    const app = buildApp();
    const res = await request(app)
      .put("/notes/ghost")
      .send({ content: "Something" });
    expect(res.status).toBe(404);
  });

  it("DELETE /:bookmarkId removes note", async () => {
    const app = buildApp();
    await request(app).post("/notes/bm-4").send({ content: "To delete" });
    const del = await request(app).delete("/notes/bm-4");
    expect(del.status).toBe(204);
    const get = await request(app).get("/notes/bm-4");
    expect(get.status).toBe(404);
  });

  it("GET / returns all notes", async () => {
    const app = buildApp();
    await request(app).post("/notes/bm-5").send({ content: "A" });
    await request(app).post("/notes/bm-6").send({ content: "B" });
    const res = await request(app).get("/notes/");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });
});

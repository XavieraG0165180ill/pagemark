import { Router, Request, Response } from "express";
import { BookmarkService } from "../services/bookmarkService";

export function createBookmarkRouter(service: BookmarkService): Router {
  const router = Router();

  router.get("/", async (_req: Request, res: Response) => {
    const bookmarks = await service.getAll();
    res.json(bookmarks);
  });

  router.get("/search", async (req: Request, res: Response) => {
    const query = String(req.query.q ?? "");
    const tags = req.query.tags ? String(req.query.tags).split(",") : undefined;
    const results = await service.search(query, tags);
    res.json(results);
  });

  router.get("/:id", async (req: Request, res: Response) => {
    const bookmark = await service.getById(req.params.id);
    if (!bookmark) {
      res.status(404).json({ error: "Bookmark not found" });
      return;
    }
    res.json(bookmark);
  });

  router.post("/", async (req: Request, res: Response) => {
    const { url, title, description, tags, favicon } = req.body;
    if (!url || !title) {
      res.status(400).json({ error: "url and title are required" });
      return;
    }
    const bookmark = await service.add({ url, title, description, tags, favicon });
    res.status(201).json(bookmark);
  });

  router.patch("/:id", async (req: Request, res: Response) => {
    const { title, description, tags, favicon } = req.body;
    const updated = await service.update(req.params.id, { title, description, tags, favicon });
    if (!updated) {
      res.status(404).json({ error: "Bookmark not found" });
      return;
    }
    res.json(updated);
  });

  router.delete("/:id", async (req: Request, res: Response) => {
    const removed = await service.remove(req.params.id);
    if (!removed) {
      res.status(404).json({ error: "Bookmark not found" });
      return;
    }
    res.status(204).send();
  });

  return router;
}

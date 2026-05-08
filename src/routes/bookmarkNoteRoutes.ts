import { Router, Request, Response } from "express";
import { BookmarkNoteService } from "../services/bookmarkNoteService.types";

export function createBookmarkNoteRouter(service: BookmarkNoteService): Router {
  const router = Router();

  router.get("/", async (_req: Request, res: Response) => {
    const notes = await service.getAll();
    res.json(notes);
  });

  router.get("/:bookmarkId", async (req: Request, res: Response) => {
    const note = await service.getByBookmarkId(req.params.bookmarkId);
    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }
    res.json(note);
  });

  router.post("/:bookmarkId", async (req: Request, res: Response) => {
    const { content } = req.body;
    if (typeof content !== "string" || content.trim() === "") {
      res.status(400).json({ error: "content is required" });
      return;
    }
    const note = await service.upsert({
      bookmarkId: req.params.bookmarkId,
      content: content.trim(),
    });
    res.status(201).json(note);
  });

  router.put("/:bookmarkId", async (req: Request, res: Response) => {
    const { content } = req.body;
    if (typeof content !== "string" || content.trim() === "") {
      res.status(400).json({ error: "content is required" });
      return;
    }
    const note = await service.update(req.params.bookmarkId, {
      content: content.trim(),
    });
    if (!note) {
      res.status(404).json({ error: "Note not found" });
      return;
    }
    res.json(note);
  });

  router.delete("/:bookmarkId", async (req: Request, res: Response) => {
    const deleted = await service.delete(req.params.bookmarkId);
    if (!deleted) {
      res.status(404).json({ error: "Note not found" });
      return;
    }
    res.status(204).send();
  });

  return router;
}

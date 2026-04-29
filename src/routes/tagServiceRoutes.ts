import { Router, Request, Response } from "express";
import { createTagService } from "../services/tagService";
import { createInMemoryTagStore } from "../store/tagStore";
import { createInMemoryBookmarkStore } from "../store/bookmarkStore";

export function createTagServiceRouter(
  tagService: ReturnType<typeof createTagService>
): Router {
  const router = Router();

  router.get("/", async (_req: Request, res: Response) => {
    const tags = await tagService.getAll();
    res.json(tags);
  });

  router.get("/:slug", async (req: Request, res: Response) => {
    const tag = await tagService.getBySlug(req.params.slug);
    if (!tag) return res.status(404).json({ error: "Tag not found" });
    res.json(tag);
  });

  router.post("/", async (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "name is required" });
    }
    const tag = await tagService.getOrCreate(name);
    res.status(201).json(tag);
  });

  router.patch("/:slug/rename", async (req: Request, res: Response) => {
    const { name } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "name is required" });
    }
    try {
      const tag = await tagService.rename(req.params.slug, name);
      res.json(tag);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  router.post("/:slug/merge", async (req: Request, res: Response) => {
    const { targetSlug } = req.body;
    if (!targetSlug || typeof targetSlug !== "string") {
      return res.status(400).json({ error: "targetSlug is required" });
    }
    try {
      const tag = await tagService.mergeInto(req.params.slug, targetSlug);
      res.json(tag);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  router.delete("/:slug", async (req: Request, res: Response) => {
    try {
      await tagService.delete(req.params.slug);
      res.status(204).send();
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  return router;
}

import { Router, Request, Response } from "express";
import { createInMemoryTagStore } from "../store/tagStore";

type TagStore = ReturnType<typeof createInMemoryTagStore>;

export function createTagRouter(tagStore: TagStore): Router {
  const router = Router();

  // GET /tags — list all tags
  router.get("/", async (_req: Request, res: Response) => {
    try {
      const tags = await tagStore.getAll();
      res.json(tags);
    } catch (err) {
      res.status(500).json({ error: "Failed to retrieve tags" });
    }
  });

  // GET /tags/:slug — get a single tag by slug
  router.get("/:slug", async (req: Request, res: Response) => {
    try {
      const tag = await tagStore.getBySlug(req.params.slug);
      if (!tag) {
        return res.status(404).json({ error: "Tag not found" });
      }
      res.json(tag);
    } catch (err) {
      res.status(500).json({ error: "Failed to retrieve tag" });
    }
  });

  // DELETE /tags/:slug — remove a tag by slug
  router.delete("/:slug", async (req: Request, res: Response) => {
    try {
      const tag = await tagStore.getBySlug(req.params.slug);
      if (!tag) {
        return res.status(404).json({ error: "Tag not found" });
      }
      await tagStore.remove(req.params.slug);
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: "Failed to delete tag" });
    }
  });

  return router;
}

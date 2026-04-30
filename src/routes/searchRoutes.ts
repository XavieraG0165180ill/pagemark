import { Router, Request, Response } from "express";
import { createSearchService } from "../services/searchService";
import { createInMemoryBookmarkStore } from "../store/bookmarkStore";
import { createInMemorySearchStore } from "../store/searchStore";

export function createSearchRouter(
  bookmarkStore: ReturnType<typeof createInMemoryBookmarkStore>,
  searchStore: ReturnType<typeof createInMemorySearchStore>
): Router {
  const router = Router();
  const searchService = createSearchService(bookmarkStore, searchStore);

  router.get("/", async (req: Request, res: Response) => {
    try {
      const q = typeof req.query.q === "string" ? req.query.q : undefined;
      const tags =
        typeof req.query.tags === "string"
          ? req.query.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : Array.isArray(req.query.tags)
          ? (req.query.tags as string[])
          : [];
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      if (isNaN(page) || page < 1) {
        return res.status(400).json({ error: "Invalid page parameter" });
      }
      if (isNaN(limit) || limit < 1 || limit > 100) {
        return res.status(400).json({ error: "Invalid limit parameter (1-100)" });
      }

      const result = await searchService.search({ q, tags, page, limit });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  return router;
}

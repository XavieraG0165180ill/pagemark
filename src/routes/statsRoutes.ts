import { Router, Request, Response } from "express";
import { createStatsService } from "../services/statsService";
import { createInMemoryBookmarkStore } from "../store/bookmarkStore";
import { createInMemoryTagStore } from "../store/tagStore";
import { createInMemoryCollectionStore } from "../store/collectionStore";

type StatsService = ReturnType<typeof createStatsService>;

export function createStatsRouter(statsService: StatsService): Router {
  const router = Router();

  router.get("/", async (_req: Request, res: Response) => {
    try {
      const stats = await statsService.getStats();
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: "Failed to retrieve stats" });
    }
  });

  router.get("/tags", async (_req: Request, res: Response) => {
    try {
      const tagStats = await statsService.getTagStats();
      res.json(tagStats);
    } catch (err) {
      res.status(500).json({ error: "Failed to retrieve tag stats" });
    }
  });

  router.get("/collections", async (_req: Request, res: Response) => {
    try {
      const collectionStats = await statsService.getCollectionStats();
      res.json(collectionStats);
    } catch (err) {
      res.status(500).json({ error: "Failed to retrieve collection stats" });
    }
  });

  return router;
}

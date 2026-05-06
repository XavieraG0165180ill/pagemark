import { Router, Request, Response } from "express";
import { DuplicateService } from "../services/duplicateService";

export function createDuplicateRouter(duplicateService: DuplicateService): Router {
  const router = Router();

  router.get("/duplicates", async (_req: Request, res: Response) => {
    try {
      const report = await duplicateService.findDuplicates();
      res.json(report);
    } catch (err) {
      res.status(500).json({ error: "Failed to find duplicates" });
    }
  });

  router.post("/duplicates/merge", async (req: Request, res: Response) => {
    const { url, keepId } = req.body as { url?: string; keepId?: string };

    if (!url || !keepId) {
      res.status(400).json({ error: "url and keepId are required" });
      return;
    }

    try {
      await duplicateService.mergeDuplicates(url, keepId);
      res.json({ success: true, message: `Merged duplicates for ${url}, kept ${keepId}` });
    } catch (err) {
      res.status(500).json({ error: "Failed to merge duplicates" });
    }
  });

  return router;
}

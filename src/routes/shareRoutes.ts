import { Router, Request, Response } from "express";
import { createShareService } from "../services/shareService";

export function createShareRouter(
  shareService: ReturnType<typeof createShareService>
): Router {
  const router = Router();

  // POST /bookmarks/:bookmarkId/share — create a share link
  router.post("/bookmarks/:bookmarkId/share", async (req: Request, res: Response) => {
    const { bookmarkId } = req.params;
    const expiresInDays = req.body?.expiresInDays
      ? Number(req.body.expiresInDays)
      : undefined;
    const link = await shareService.createShareLink(bookmarkId, expiresInDays);
    res.status(201).json(link);
  });

  // GET /bookmarks/:bookmarkId/share — list share links for bookmark
  router.get("/bookmarks/:bookmarkId/share", async (req: Request, res: Response) => {
    const links = await shareService.getLinksForBookmark(req.params.bookmarkId);
    res.json(links);
  });

  // DELETE /share/:id — revoke a share link
  router.delete("/share/:id", async (req: Request, res: Response) => {
    await shareService.deleteShareLink(req.params.id);
    res.status(204).send();
  });

  // GET /share/:token — resolve a share token (public)
  router.get("/share/:token", async (req: Request, res: Response) => {
    const link = await shareService.resolveToken(req.params.token);
    if (!link) {
      return res.status(404).json({ error: "Share link not found or expired" });
    }
    res.json(link);
  });

  return router;
}

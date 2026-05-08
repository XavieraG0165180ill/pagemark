import { Router, Request, Response } from "express";
import { createInMemoryBookmarkStore } from "../store/bookmarkStore";
import { createInMemoryTagStore } from "../store/tagStore";
import {
  exportToJson,
  parseImportData,
  importFromNetscapeHtml,
  buildNetscapeHtml,
} from "../services/importExport";
import { createBookmark } from "../models/bookmark";
import { createTag } from "../models/tag";

export function createImportExportRouter(
  bookmarkStore: ReturnType<typeof createInMemoryBookmarkStore>,
  tagStore: ReturnType<typeof createInMemoryTagStore>
): Router {
  const router = Router();

  router.get("/export/json", async (_req: Request, res: Response) => {
    const bookmarks = await bookmarkStore.getAll();
    const tags = await tagStore.getAll();
    const data = exportToJson(bookmarks, tags);
    res.setHeader("Content-Disposition", 'attachment; filename="pagemark-export.json"');
    res.json(data);
  });

  router.get("/export/html", async (_req: Request, res: Response) => {
    const bookmarks = await bookmarkStore.getAll();
    const html = buildNetscapeHtml(bookmarks);
    res.setHeader("Content-Disposition", 'attachment; filename="bookmarks.html"');
    res.setHeader("Content-Type", "text/html");
    res.send(html);
  });

  router.post("/import/json", async (req: Request, res: Response) => {
    try {
      const data = parseImportData(req.body);
      let imported = 0;
      for (const b of data.bookmarks) {
        const existing = await bookmarkStore.getById(b.id);
        if (!existing) {
          await bookmarkStore.add(b);
          imported++;
        }
      }
      res.json({ imported, skipped: data.bookmarks.length - imported, errors: [] });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(400).json({ error: message });
    }
  });

  router.post("/import/html", async (req: Request, res: Response) => {
    const { html } = req.body as { html: string };
    if (!html) {
      return res.status(400).json({ error: "Missing html field" });
    }
    const partials = importFromNetscapeHtml(html);
    if (partials.length === 0) {
      return res.status(400).json({ error: "No bookmarks found in the provided HTML" });
    }
    let imported = 0;
    const errors: string[] = [];
    for (const p of partials) {
      try {
        if (!p.url || !p.title) {
          errors.push(`Skipping entry with missing url or title: ${p.url ?? "(no url)"}`);
          continue;
        }
        const bookmark = createBookmark({ url: p.url, title: p.title, tags: p.tags ?? [] });
        await bookmarkStore.add(bookmark);
        imported++;
      } catch (e: unknown) {
        errors.push(e instanceof Error ? e.message : "Unknown error");
      }
    }
    res.json({ imported, skipped: partials.length - imported - errors.length, errors });
  });

  return router;
}

import { Router } from "express";
import { PinnedService } from "../services/pinnedService";
import { BookmarkStore } from "../store/bookmarkStore";

export function createPinnedRouter(
  pinnedService: PinnedService,
  bookmarkStore: Pick<BookmarkStore, "getById">
): Router {
  const router = Router();

  router.get("/", (_req, res) => {
    const bookmarks = pinnedService.getPinnedBookmarks((id) =>
      bookmarkStore.getById(id)
    );
    res.json({ bookmarks });
  });

  router.post("/:id", (req, res) => {
    const { id } = req.params;
    const bookmark = bookmarkStore.getById(id);
    if (!bookmark) {
      return res.status(404).json({ error: "Bookmark not found" });
    }
    pinnedService.pin(id);
    res.status(201).json({ pinned: true, bookmarkId: id });
  });

  router.delete("/:id", (req, res) => {
    const { id } = req.params;
    if (!pinnedService.isPinned(id)) {
      return res.status(404).json({ error: "Bookmark is not pinned" });
    }
    pinnedService.unpin(id);
    res.json({ pinned: false, bookmarkId: id });
  });

  router.put("/reorder", (req, res) => {
    const { ids } = req.body as { ids?: string[] };
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: "ids must be an array" });
    }
    pinnedService.reorder(ids);
    res.json({ order: pinnedService.getPinnedIds() });
  });

  return router;
}

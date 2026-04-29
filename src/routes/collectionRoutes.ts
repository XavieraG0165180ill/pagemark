import { Router, Request, Response } from "express";
import { createInMemoryCollectionStore } from "../store/collectionStore";
import { createInMemoryBookmarkStore } from "../store/bookmarkStore";
import { createCollection, updateCollection, addBookmarkToCollection, removeBookmarkFromCollection } from "../models/collection";

export function createCollectionRouter(
  collectionStore: ReturnType<typeof createInMemoryCollectionStore>,
  bookmarkStore: ReturnType<typeof createInMemoryBookmarkStore>
): Router {
  const router = Router();

  router.get("/", (_req: Request, res: Response) => {
    const collections = collectionStore.getAll();
    res.json(collections);
  });

  router.get("/:slug", (req: Request, res: Response) => {
    const collection = collectionStore.getBySlug(req.params.slug);
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }
    res.json(collection);
  });

  router.post("/", (req: Request, res: Response) => {
    const { name, description } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "name is required" });
    }
    const collection = createCollection(name, description);
    collectionStore.add(collection);
    res.status(201).json(collection);
  });

  router.patch("/:slug", (req: Request, res: Response) => {
    const collection = collectionStore.getBySlug(req.params.slug);
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }
    const updated = updateCollection(collection, req.body);
    collectionStore.update(updated);
    res.json(updated);
  });

  router.delete("/:slug", (req: Request, res: Response) => {
    const collection = collectionStore.getBySlug(req.params.slug);
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }
    collectionStore.remove(collection.id);
    res.status(204).send();
  });

  router.post("/:slug/bookmarks/:bookmarkId", (req: Request, res: Response) => {
    const collection = collectionStore.getBySlug(req.params.slug);
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }
    const bookmark = bookmarkStore.getById(req.params.bookmarkId);
    if (!bookmark) {
      return res.status(404).json({ error: "Bookmark not found" });
    }
    const updated = addBookmarkToCollection(collection, req.params.bookmarkId);
    collectionStore.update(updated);
    res.json(updated);
  });

  router.delete("/:slug/bookmarks/:bookmarkId", (req: Request, res: Response) => {
    const collection = collectionStore.getBySlug(req.params.slug);
    if (!collection) {
      return res.status(404).json({ error: "Collection not found" });
    }
    const updated = removeBookmarkFromCollection(collection, req.params.bookmarkId);
    collectionStore.update(updated);
    res.json(updated);
  });

  return router;
}

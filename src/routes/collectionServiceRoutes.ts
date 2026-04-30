import { Router, Request, Response } from 'express';
import { createCollectionService } from '../services/collectionService';
import { createInMemoryCollectionStore } from '../store/collectionStore';
import { createInMemoryBookmarkStore } from '../store/bookmarkStore';

export function createCollectionServiceRouter(
  service: ReturnType<typeof createCollectionService>
): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    res.json(service.getAllCollections());
  });

  router.post('/', (req: Request, res: Response) => {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const collection = service.createCollection(name, description);
    return res.status(201).json(collection);
  });

  router.get('/:id', (req: Request, res: Response) => {
    const collection = service.getCollection(req.params.id);
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    return res.json(collection);
  });

  router.patch('/:id', (req: Request, res: Response) => {
    try {
      const updated = service.updateCollection(req.params.id, req.body);
      return res.json(updated);
    } catch {
      return res.status(404).json({ error: 'Collection not found' });
    }
  });

  router.delete('/:id', (req: Request, res: Response) => {
    try {
      service.deleteCollection(req.params.id);
      return res.status(204).send();
    } catch {
      return res.status(404).json({ error: 'Collection not found' });
    }
  });

  router.post('/:id/bookmarks', (req: Request, res: Response) => {
    const { bookmarkId } = req.body;
    if (!bookmarkId) return res.status(400).json({ error: 'bookmarkId is required' });
    try {
      const updated = service.addBookmark(req.params.id, bookmarkId);
      return res.json(updated);
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  });

  router.delete('/:id/bookmarks/:bookmarkId', (req: Request, res: Response) => {
    try {
      const updated = service.removeBookmark(req.params.id, req.params.bookmarkId);
      return res.json(updated);
    } catch (err: any) {
      return res.status(404).json({ error: err.message });
    }
  });

  router.get('/:id/bookmarks', (req: Request, res: Response) => {
    try {
      const ids = service.getBookmarksInCollection(req.params.id);
      return res.json({ bookmarkIds: ids });
    } catch {
      return res.status(404).json({ error: 'Collection not found' });
    }
  });

  return router;
}

import { Router, Request, Response } from 'express';
import { createReadingListService, createInMemoryReadingListStore } from '../services/readingListService';

type ReadingListService = ReturnType<typeof createReadingListService>;

export function createReadingListRouter(service: ReadingListService): Router {
  const router = Router();

  router.get('/', async (_req: Request, res: Response) => {
    const entries = await service.getAll();
    res.json(entries);
  });

  router.get('/unread', async (_req: Request, res: Response) => {
    const entries = await service.getUnread();
    res.json(entries);
  });

  router.post('/', async (req: Request, res: Response) => {
    const { bookmarkId, url, title } = req.body;
    if (!bookmarkId || !url || !title) {
      return res.status(400).json({ error: 'bookmarkId, url, and title are required' });
    }
    const entry = await service.add(bookmarkId, url, title);
    res.status(201).json(entry);
  });

  router.patch('/:id/read', async (req: Request, res: Response) => {
    const entry = await service.markAsRead(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Reading list entry not found' });
    }
    res.json(entry);
  });

  router.delete('/:id', async (req: Request, res: Response) => {
    await service.remove(req.params.id);
    res.status(204).send();
  });

  return router;
}

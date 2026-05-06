import { Router, Request, Response } from 'express';
import { createReminderService } from '../services/reminderService';

type ReminderService = ReturnType<typeof createReminderService>;

export function createReminderRouter(service: ReminderService): Router {
  const router = Router();

  router.get('/', async (_req: Request, res: Response) => {
    const reminders = await service.getAll();
    res.json(reminders);
  });

  router.get('/due', async (_req: Request, res: Response) => {
    const due = await service.getDue();
    res.json(due);
  });

  router.get('/bookmark/:bookmarkId', async (req: Request, res: Response) => {
    const reminders = await service.getByBookmark(req.params.bookmarkId);
    res.json(reminders);
  });

  router.post('/', async (req: Request, res: Response) => {
    const { bookmarkId, remindAt, note } = req.body;
    if (!bookmarkId || !remindAt) {
      return res.status(400).json({ error: 'bookmarkId and remindAt are required' });
    }
    const reminder = await service.create(bookmarkId, remindAt, note);
    res.status(201).json(reminder);
  });

  router.post('/:id/dismiss', async (req: Request, res: Response) => {
    await service.dismiss(req.params.id);
    res.status(204).send();
  });

  router.delete('/:id', async (req: Request, res: Response) => {
    await service.delete(req.params.id);
    res.status(204).send();
  });

  return router;
}

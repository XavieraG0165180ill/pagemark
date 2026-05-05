import { Router, Request, Response } from "express";
import { ReminderService } from "../services/reminderService";

export function createReminderRouter(reminderService: ReminderService): Router {
  const router = Router();

  router.get("/", async (_req: Request, res: Response) => {
    const reminders = await reminderService.getAll();
    res.json(reminders);
  });

  router.get("/pending", async (_req: Request, res: Response) => {
    const pending = await reminderService.getPending(new Date());
    res.json(pending);
  });

  router.post("/", async (req: Request, res: Response) => {
    const { bookmarkId, remindAt, note } = req.body;
    if (!bookmarkId || !remindAt) {
      res.status(400).json({ error: "bookmarkId and remindAt are required" });
      return;
    }
    const date = new Date(remindAt);
    if (isNaN(date.getTime())) {
      res.status(400).json({ error: "Invalid remindAt date" });
      return;
    }
    const reminder = await reminderService.schedule(bookmarkId, date, note);
    res.status(201).json(reminder);
  });

  router.post("/:id/dismiss", async (req: Request, res: Response) => {
    const dismissed = await reminderService.dismiss(req.params.id);
    if (!dismissed) {
      res.status(404).json({ error: "Reminder not found" });
      return;
    }
    res.json(dismissed);
  });

  router.delete("/:id", async (req: Request, res: Response) => {
    const cancelled = await reminderService.cancel(req.params.id);
    if (!cancelled) {
      res.status(404).json({ error: "Reminder not found" });
      return;
    }
    res.status(204).send();
  });

  return router;
}

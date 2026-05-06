import { Router, Request, Response } from "express";
import {
  createNotificationService,
  createInMemoryNotificationStore,
  NotificationChannel,
} from "../services/notificationService";

export function createNotificationRouter(
  service: ReturnType<typeof createNotificationService> = createNotificationService(
    createInMemoryNotificationStore()
  )
) {
  const router = Router();

  router.get("/users/:userId", (req: Request, res: Response) => {
    const notifications = service.getForUser(req.params.userId);
    res.json(notifications);
  });

  router.post("/users/:userId/send", (req: Request, res: Response) => {
    const { type, title, body, channel } = req.body;
    if (!type || !title || !body) {
      return res.status(400).json({ error: "type, title, and body are required" });
    }
    const notification = service.send(
      req.params.userId,
      type,
      title,
      body,
      (channel as NotificationChannel) ?? "browser"
    );
    res.status(201).json(notification);
  });

  router.patch("/:id/read", (req: Request, res: Response) => {
    const success = service.markRead(req.params.id);
    if (!success) return res.status(404).json({ error: "Notification not found" });
    res.json({ success: true });
  });

  router.delete("/:id", (req: Request, res: Response) => {
    const success = service.deleteNotification(req.params.id);
    if (!success) return res.status(404).json({ error: "Notification not found" });
    res.status(204).send();
  });

  router.get("/users/:userId/preferences", (req: Request, res: Response) => {
    const prefs = service.getPreferences(req.params.userId);
    if (!prefs) return res.status(404).json({ error: "Preferences not found" });
    res.json(prefs);
  });

  router.put("/users/:userId/preferences", (req: Request, res: Response) => {
    const { channels, reminderAlerts, weeklyDigest, webhookUrl } = req.body;
    if (!channels) {
      return res.status(400).json({ error: "channels is required" });
    }
    const prefs = service.setPreferences({
      userId: req.params.userId,
      channels,
      reminderAlerts: !!reminderAlerts,
      weeklyDigest: !!weeklyDigest,
      webhookUrl,
    });
    res.json(prefs);
  });

  return router;
}

import { Router } from "express";
import { AuditService, AuditAction } from "../services/auditService";

const VALID_ACTIONS: AuditAction[] = [
  "bookmark.created",
  "bookmark.updated",
  "bookmark.deleted",
  "collection.created",
  "collection.updated",
  "collection.deleted",
  "tag.created",
  "tag.deleted",
  "import.completed",
  "export.completed",
];

export function createAuditRouter(auditService: AuditService): Router {
  const router = Router();

  router.get("/", (_req, res) => {
    const entries = auditService.getAll();
    res.json({ entries, total: entries.length });
  });

  router.get("/by-action/:action", (req, res) => {
    const { action } = req.params;
    if (!VALID_ACTIONS.includes(action as AuditAction)) {
      return res.status(400).json({ error: `Invalid action: ${action}` });
    }
    const entries = auditService.getByAction(action as AuditAction);
    res.json({ entries, total: entries.length });
  });

  router.get("/by-resource/:resourceId", (req, res) => {
    const { resourceId } = req.params;
    const entries = auditService.getByResourceId(resourceId);
    res.json({ entries, total: entries.length });
  });

  return router;
}

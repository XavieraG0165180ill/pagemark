import { describe, it, expect, beforeEach } from "vitest";
import {
  createInMemoryAuditStore,
  createAuditService,
  AuditService,
} from "./auditService";

function buildService(): AuditService {
  const store = createInMemoryAuditStore();
  return createAuditService(store);
}

describe("auditService", () => {
  let service: AuditService;

  beforeEach(() => {
    service = buildService();
  });

  it("logs an entry and returns it with id and timestamp", () => {
    const entry = service.log("bookmark.created", {
      resourceId: "bm_1",
      resourceType: "bookmark",
    });
    expect(entry.id).toMatch(/^audit_/);
    expect(entry.action).toBe("bookmark.created");
    expect(entry.resourceId).toBe("bm_1");
    expect(entry.timestamp).toBeTruthy();
  });

  it("getAll returns all logged entries", () => {
    service.log("bookmark.created", { resourceId: "bm_1" });
    service.log("tag.created", { resourceId: "tag_1" });
    expect(service.getAll()).toHaveLength(2);
  });

  it("getByAction filters entries by action", () => {
    service.log("bookmark.created", { resourceId: "bm_1" });
    service.log("bookmark.deleted", { resourceId: "bm_2" });
    service.log("bookmark.created", { resourceId: "bm_3" });
    const results = service.getByAction("bookmark.created");
    expect(results).toHaveLength(2);
    expect(results.every((e) => e.action === "bookmark.created")).toBe(true);
  });

  it("getByResourceId filters entries by resourceId", () => {
    service.log("bookmark.created", { resourceId: "bm_1" });
    service.log("bookmark.updated", { resourceId: "bm_1" });
    service.log("bookmark.created", { resourceId: "bm_2" });
    const results = service.getByResourceId("bm_1");
    expect(results).toHaveLength(2);
    expect(results.every((e) => e.resourceId === "bm_1")).toBe(true);
  });

  it("supports optional meta field", () => {
    const entry = service.log("import.completed", {
      meta: { count: 42 },
    });
    expect(entry.meta).toEqual({ count: 42 });
  });

  it("returns empty array when no entries match action", () => {
    service.log("bookmark.created");
    expect(service.getByAction("export.completed")).toHaveLength(0);
  });

  it("assigns unique ids to each entry", () => {
    const a = service.log("bookmark.created");
    const b = service.log("bookmark.created");
    expect(a.id).not.toBe(b.id);
  });
});

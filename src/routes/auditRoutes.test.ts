import { describe, it, expect, beforeEach } from "vitest";
import express, { Express } from "express";
import request from "supertest";
import {
  createInMemoryAuditStore,
  createAuditService,
  AuditService,
} from "../services/auditService";
import { createAuditRouter } from "./auditRoutes";

function buildApp(): { app: Express; auditService: AuditService } {
  const app = express();
  app.use(express.json());
  const store = createInMemoryAuditStore();
  const auditService = createAuditService(store);
  app.use("/audit", createAuditRouter(auditService));
  return { app, auditService };
}

describe("GET /audit", () => {
  it("returns empty list initially", async () => {
    const { app } = buildApp();
    const res = await request(app).get("/audit");
    expect(res.status).toBe(200);
    expect(res.body.entries).toEqual([]);
    expect(res.body.total).toBe(0);
  });

  it("returns all logged entries", async () => {
    const { app, auditService } = buildApp();
    auditService.log("bookmark.created", { resourceId: "bm_1" });
    auditService.log("tag.created", { resourceId: "tag_1" });
    const res = await request(app).get("/audit");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
  });
});

describe("GET /audit/by-action/:action", () => {
  it("returns entries filtered by action", async () => {
    const { app, auditService } = buildApp();
    auditService.log("bookmark.created", { resourceId: "bm_1" });
    auditService.log("bookmark.deleted", { resourceId: "bm_2" });
    const res = await request(app).get("/audit/by-action/bookmark.created");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.entries[0].action).toBe("bookmark.created");
  });

  it("returns 400 for an invalid action", async () => {
    const { app } = buildApp();
    const res = await request(app).get("/audit/by-action/unknown.action");
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid action/);
  });
});

describe("GET /audit/by-resource/:resourceId", () => {
  it("returns entries filtered by resourceId", async () => {
    const { app, auditService } = buildApp();
    auditService.log("bookmark.created", { resourceId: "bm_42" });
    auditService.log("bookmark.updated", { resourceId: "bm_42" });
    auditService.log("bookmark.created", { resourceId: "bm_99" });
    const res = await request(app).get("/audit/by-resource/bm_42");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.entries.every((e: { resourceId: string }) => e.resourceId === "bm_42")).toBe(true);
  });

  it("returns empty list when resourceId has no entries", async () => {
    const { app } = buildApp();
    const res = await request(app).get("/audit/by-resource/nonexistent");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
  });
});

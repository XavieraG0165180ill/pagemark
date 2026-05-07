import { describe, it, expect, beforeEach } from "vitest";
import {
  createInMemoryExportScheduleStore,
  createExportScheduleService,
} from "./exportScheduleService";
import { createBookmark } from "../models/bookmark";

function buildService() {
  const store = createInMemoryExportScheduleStore();
  const bookmarks = [
    createBookmark({ url: "https://example.com", title: "Example", tags: [] }),
  ];
  const service = createExportScheduleService(store, () => bookmarks);
  return { service, bookmarks };
}

describe("exportScheduleService", () => {
  it("creates a schedule and retrieves it", () => {
    const { service } = buildService();
    const schedule = service.create("json", 60_000);
    expect(schedule.format).toBe("json");
    expect(schedule.intervalMs).toBe(60_000);
    expect(schedule.lastRunAt).toBeNull();
    expect(service.getById(schedule.id)).toEqual(schedule);
  });

  it("lists all schedules", () => {
    const { service } = buildService();
    service.create("json", 60_000);
    service.create("netscape", 120_000);
    expect(service.getAll()).toHaveLength(2);
  });

  it("removes a schedule", () => {
    const { service } = buildService();
    const schedule = service.create("json", 60_000);
    expect(service.remove(schedule.id)).toBe(true);
    expect(service.getById(schedule.id)).toBeUndefined();
  });

  it("runDue runs schedules that are overdue", () => {
    const { service } = buildService();
    service.create("json", 0);
    const results = service.runDue();
    expect(results).toHaveLength(1);
    expect(results[0].payload).toContain("example.com");
  });

  it("runDue skips schedules not yet due", () => {
    const { service } = buildService();
    const schedule = service.create("json", 999_999_999);
    // Manually set lastRunAt to now so it's not due
    const store = createInMemoryExportScheduleStore();
    store.add({ ...schedule, lastRunAt: new Date().toISOString() });
    const s2 = createExportScheduleService(store, () => []);
    const results = s2.runDue();
    expect(results).toHaveLength(0);
  });

  it("runDue updates lastRunAt after running", () => {
    const { service } = buildService();
    const schedule = service.create("json", 0);
    service.runDue();
    const updated = service.getById(schedule.id);
    expect(updated?.lastRunAt).not.toBeNull();
  });
});

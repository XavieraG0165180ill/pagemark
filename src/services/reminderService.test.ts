import { describe, it, expect, beforeEach } from "vitest";
import {
  createInMemoryReminderStore,
  createReminderService,
  ReminderService,
} from "./reminderService";

function buildService(): ReminderService {
  const store = createInMemoryReminderStore();
  return createReminderService(store);
}

describe("reminderService", () => {
  let service: ReminderService;

  beforeEach(() => {
    service = buildService();
  });

  it("schedules a reminder for a bookmark", async () => {
    const remindAt = new Date(Date.now() + 60_000);
    const reminder = await service.schedule("bm-1", remindAt, "Read this!");
    expect(reminder.bookmarkId).toBe("bm-1");
    expect(reminder.remindAt).toEqual(remindAt);
    expect(reminder.note).toBe("Read this!");
    expect(reminder.triggered).toBe(false);
    expect(reminder.id).toBeTruthy();
  });

  it("returns no pending reminders when none are due", async () => {
    const future = new Date(Date.now() + 60_000);
    await service.schedule("bm-1", future);
    const pending = await service.getPending(new Date());
    expect(pending).toHaveLength(0);
  });

  it("returns pending reminders when due", async () => {
    const past = new Date(Date.now() - 1000);
    await service.schedule("bm-2", past, "Overdue");
    const pending = await service.getPending(new Date());
    expect(pending).toHaveLength(1);
    expect(pending[0].bookmarkId).toBe("bm-2");
  });

  it("dismisses a reminder by marking it triggered", async () => {
    const past = new Date(Date.now() - 1000);
    const reminder = await service.schedule("bm-3", past);
    const dismissed = await service.dismiss(reminder.id);
    expect(dismissed?.triggered).toBe(true);
    const pending = await service.getPending(new Date());
    expect(pending).toHaveLength(0);
  });

  it("cancels a reminder entirely", async () => {
    const reminder = await service.schedule("bm-4", new Date());
    const cancelled = await service.cancel(reminder.id);
    expect(cancelled).toBe(true);
    const all = await service.getAll();
    expect(all).toHaveLength(0);
  });

  it("returns all reminders regardless of status", async () => {
    await service.schedule("bm-1", new Date(Date.now() - 1000));
    await service.schedule("bm-2", new Date(Date.now() + 1000));
    const all = await service.getAll();
    expect(all).toHaveLength(2);
  });

  it("returns undefined when dismissing non-existent reminder", async () => {
    const result = await service.dismiss("nonexistent");
    expect(result).toBeUndefined();
  });
});

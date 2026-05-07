import { exportToJson } from "./importExport";
import { Bookmark } from "../models/bookmark";

export type ExportFormat = "json" | "netscape";

export interface ScheduledExport {
  id: string;
  format: ExportFormat;
  intervalMs: number;
  lastRunAt: string | null;
  createdAt: string;
}

export interface ExportScheduleStore {
  add(schedule: ScheduledExport): void;
  getById(id: string): ScheduledExport | undefined;
  getAll(): ScheduledExport[];
  update(id: string, patch: Partial<ScheduledExport>): ScheduledExport | undefined;
  remove(id: string): boolean;
}

export function generateExportId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function createInMemoryExportScheduleStore(): ExportScheduleStore {
  const schedules = new Map<string, ScheduledExport>();
  return {
    add(schedule) { schedules.set(schedule.id, schedule); },
    getById(id) { return schedules.get(id); },
    getAll() { return Array.from(schedules.values()); },
    update(id, patch) {
      const existing = schedules.get(id);
      if (!existing) return undefined;
      const updated = { ...existing, ...patch };
      schedules.set(id, updated);
      return updated;
    },
    remove(id) { return schedules.delete(id); },
  };
}

export function createExportScheduleService(
  store: ExportScheduleStore,
  getBookmarks: () => Bookmark[]
) {
  return {
    create(format: ExportFormat, intervalMs: number): ScheduledExport {
      const schedule: ScheduledExport = {
        id: generateExportId(),
        format,
        intervalMs,
        lastRunAt: null,
        createdAt: new Date().toISOString(),
      };
      store.add(schedule);
      return schedule;
    },

    getAll(): ScheduledExport[] {
      return store.getAll();
    },

    getById(id: string): ScheduledExport | undefined {
      return store.getById(id);
    },

    remove(id: string): boolean {
      return store.remove(id);
    },

    runDue(): { id: string; payload: string }[] {
      const now = Date.now();
      const results: { id: string; payload: string }[] = [];
      for (const schedule of store.getAll()) {
        const lastRun = schedule.lastRunAt ? new Date(schedule.lastRunAt).getTime() : 0;
        if (now - lastRun >= schedule.intervalMs) {
          const bookmarks = getBookmarks();
          const payload = exportToJson(bookmarks);
          store.update(schedule.id, { lastRunAt: new Date().toISOString() });
          results.push({ id: schedule.id, payload });
        }
      }
      return results;
    },
  };
}

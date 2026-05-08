import { describe, it, expect, beforeEach } from "vitest";
import {
  createInMemoryBookmarkNoteStore,
  createBookmarkNoteService,
  BookmarkNoteService,
} from "./bookmarkNoteService";

function buildService(): BookmarkNoteService {
  const store = createInMemoryBookmarkNoteStore();
  return createBookmarkNoteService(store);
}

describe("bookmarkNoteService", () => {
  let service: BookmarkNoteService;

  beforeEach(() => {
    service = buildService();
  });

  it("returns undefined for a note that does not exist", () => {
    expect(service.getNote("bm-1")).toBeUndefined();
  });

  it("creates a new note for a bookmark", () => {
    const note = service.upsertNote("bm-1", "interesting article");
    expect(note.bookmarkId).toBe("bm-1");
    expect(note.content).toBe("interesting article");
    expect(note.createdAt).toBeTruthy();
    expect(note.updatedAt).toBeTruthy();
  });

  it("retrieves an existing note", () => {
    service.upsertNote("bm-1", "my note");
    const note = service.getNote("bm-1");
    expect(note).toBeDefined();
    expect(note?.content).toBe("my note");
  });

  it("updates an existing note and preserves createdAt", async () => {
    const first = service.upsertNote("bm-1", "original");
    await new Promise((r) => setTimeout(r, 5));
    const second = service.upsertNote("bm-1", "updated");
    expect(second.content).toBe("updated");
    expect(second.createdAt).toBe(first.createdAt);
    expect(second.updatedAt).not.toBe(first.updatedAt);
  });

  it("deletes a note and returns true", () => {
    service.upsertNote("bm-1", "to delete");
    const result = service.deleteNote("bm-1");
    expect(result).toBe(true);
    expect(service.getNote("bm-1")).toBeUndefined();
  });

  it("returns false when deleting a non-existent note", () => {
    expect(service.deleteNote("bm-999")).toBe(false);
  });

  it("returns all notes", () => {
    service.upsertNote("bm-1", "note one");
    service.upsertNote("bm-2", "note two");
    const all = service.getAllNotes();
    expect(all).toHaveLength(2);
    expect(all.map((n) => n.bookmarkId).sort()).toEqual(["bm-1", "bm-2"]);
  });

  it("returns empty array when no notes exist", () => {
    expect(service.getAllNotes()).toEqual([]);
  });
});

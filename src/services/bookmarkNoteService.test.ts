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

  it("returns undefined for a bookmark with no note", () => {
    expect(service.getNote("bm-1")).toBeUndefined();
  });

  it("creates a note for a bookmark", () => {
    const note = service.upsertNote("bm-1", "This is a great article.");
    expect(note.bookmarkId).toBe("bm-1");
    expect(note.content).toBe("This is a great article.");
    expect(note.createdAt).toBeTruthy();
    expect(note.updatedAt).toBeTruthy();
  });

  it("retrieves an existing note", () => {
    service.upsertNote("bm-1", "My note");
    const note = service.getNote("bm-1");
    expect(note).toBeDefined();
    expect(note?.content).toBe("My note");
  });

  it("updates an existing note and preserves createdAt", () => {
    const first = service.upsertNote("bm-1", "Original");
    const second = service.upsertNote("bm-1", "Updated");
    expect(second.content).toBe("Updated");
    expect(second.createdAt).toBe(first.createdAt);
    expect(second.updatedAt).not.toBe(first.updatedAt === second.updatedAt ? null : first.updatedAt);
  });

  it("deletes a note and returns true", () => {
    service.upsertNote("bm-1", "To be deleted");
    const result = service.deleteNote("bm-1");
    expect(result).toBe(true);
    expect(service.getNote("bm-1")).toBeUndefined();
  });

  it("returns false when deleting a non-existent note", () => {
    const result = service.deleteNote("bm-999");
    expect(result).toBe(false);
  });

  it("returns all notes", () => {
    service.upsertNote("bm-1", "Note 1");
    service.upsertNote("bm-2", "Note 2");
    const all = service.getAllNotes();
    expect(all).toHaveLength(2);
    expect(all.map((n) => n.bookmarkId)).toContain("bm-1");
    expect(all.map((n) => n.bookmarkId)).toContain("bm-2");
  });

  it("returns empty array when no notes exist", () => {
    expect(service.getAllNotes()).toEqual([]);
  });
});

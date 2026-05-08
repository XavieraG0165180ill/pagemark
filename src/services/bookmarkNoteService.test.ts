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
  it("creates a note for a bookmark", () => {
    const service = buildService();
    const note = service.upsert("bm-1", "This is a great article.");
    expect(note.bookmarkId).toBe("bm-1");
    expect(note.content).toBe("This is a great article.");
    expect(note.createdAt).toBeDefined();
    expect(note.updatedAt).toBeDefined();
  });

  it("returns undefined for a bookmark with no note", () => {
    const service = buildService();
    expect(service.get("bm-999")).toBeUndefined();
  });

  it("retrieves an existing note", () => {
    const service = buildService();
    service.upsert("bm-2", "Remember to share this.");
    const note = service.get("bm-2");
    expect(note).toBeDefined();
    expect(note?.content).toBe("Remember to share this.");
  });

  it("updates content while preserving createdAt", () => {
    const service = buildService();
    const original = service.upsert("bm-3", "First draft.");
    const updated = service.upsert("bm-3", "Revised note.");
    expect(updated.content).toBe("Revised note.");
    expect(updated.createdAt).toBe(original.createdAt);
    expect(updated.id).toBe(original.id);
  });

  it("deletes a note", () => {
    const service = buildService();
    service.upsert("bm-4", "To be deleted.");
    const result = service.delete("bm-4");
    expect(result).toBe(true);
    expect(service.get("bm-4")).toBeUndefined();
  });

  it("returns false when deleting a non-existent note", () => {
    const service = buildService();
    expect(service.delete("bm-none")).toBe(false);
  });

  it("lists all notes", () => {
    const service = buildService();
    service.upsert("bm-5", "Note A");
    service.upsert("bm-6", "Note B");
    const all = service.getAll();
    expect(all).toHaveLength(2);
    const ids = all.map((n) => n.bookmarkId);
    expect(ids).toContain("bm-5");
    expect(ids).toContain("bm-6");
  });
});

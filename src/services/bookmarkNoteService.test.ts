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
    const note = service.upsert("bm-1", "This is a great resource.");
    expect(note.bookmarkId).toBe("bm-1");
    expect(note.content).toBe("This is a great resource.");
    expect(note.createdAt).toBeDefined();
    expect(note.updatedAt).toBeDefined();
  });

  it("updates an existing note without changing createdAt", () => {
    const service = buildService();
    const first = service.upsert("bm-1", "Initial note");
    const second = service.upsert("bm-1", "Updated note");
    expect(second.content).toBe("Updated note");
    expect(second.createdAt).toBe(first.createdAt);
    expect(second.id).toBe(first.id);
  });

  it("retrieves a note by bookmarkId", () => {
    const service = buildService();
    service.upsert("bm-2", "Some note");
    const note = service.get("bm-2");
    expect(note).toBeDefined();
    expect(note?.content).toBe("Some note");
  });

  it("returns undefined for a bookmark with no note", () => {
    const service = buildService();
    expect(service.get("bm-999")).toBeUndefined();
  });

  it("deletes a note", () => {
    const service = buildService();
    service.upsert("bm-3", "To be deleted");
    const result = service.delete("bm-3");
    expect(result).toBe(true);
    expect(service.get("bm-3")).toBeUndefined();
  });

  it("returns false when deleting a non-existent note", () => {
    const service = buildService();
    expect(service.delete("bm-missing")).toBe(false);
  });

  it("returns all notes", () => {
    const service = buildService();
    service.upsert("bm-1", "Note one");
    service.upsert("bm-2", "Note two");
    const all = service.getAll();
    expect(all).toHaveLength(2);
    expect(all.map((n) => n.bookmarkId)).toEqual(
      expect.arrayContaining(["bm-1", "bm-2"])
    );
  });
});

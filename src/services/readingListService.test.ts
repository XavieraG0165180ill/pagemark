import { describe, it, expect, beforeEach } from "vitest";
import {
  createInMemoryReadingListStore,
  createReadingListService,
  ReadingListService,
} from "./readingListService";
import { Bookmark } from "../models/bookmark";

const mockBookmark: Bookmark = {
  id: "bm1",
  url: "https://example.com",
  title: "Example",
  tags: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function buildService(bookmarks: Bookmark[] = [mockBookmark]): ReadingListService {
  const store = createInMemoryReadingListStore();
  const getById = async (id: string) => bookmarks.find((b) => b.id === id);
  return createReadingListService(store, getById);
}

describe("readingListService", () => {
  let service: ReadingListService;

  beforeEach(() => {
    service = buildService();
  });

  it("adds a bookmark to the reading list", async () => {
    const entry = await service.addToList("bm1");
    expect(entry.bookmarkId).toBe("bm1");
    expect(entry.addedAt).toBeDefined();
    expect(entry.readAt).toBeUndefined();
  });

  it("returns existing entry when adding duplicate", async () => {
    const first = await service.addToList("bm1");
    const second = await service.addToList("bm1");
    expect(first.addedAt).toBe(second.addedAt);
  });

  it("throws if bookmark not found", async () => {
    await expect(service.addToList("nonexistent")).rejects.toThrow("Bookmark not found");
  });

  it("removes a bookmark from the reading list", async () => {
    await service.addToList("bm1");
    await service.removeFromList("bm1");
    const list = await service.getList();
    expect(list).toHaveLength(0);
  });

  it("marks a bookmark as read", async () => {
    await service.addToList("bm1");
    const entry = await service.markAsRead("bm1");
    expect(entry.readAt).toBeDefined();
  });

  it("throws when marking untracked bookmark as read", async () => {
    await expect(service.markAsRead("bm1")).rejects.toThrow("not in reading list");
  });

  it("returns only unread entries", async () => {
    await service.addToList("bm1");
    const unread = await service.getUnread();
    expect(unread).toHaveLength(1);
    await service.markAsRead("bm1");
    const unreadAfter = await service.getUnread();
    expect(unreadAfter).toHaveLength(0);
  });

  it("returns full list", async () => {
    await service.addToList("bm1");
    const list = await service.getList();
    expect(list).toHaveLength(1);
  });
});

import { Bookmark, CreateBookmarkInput, UpdateBookmarkInput } from "../models/bookmark";
import { createBookmark, updateBookmark } from "../models/bookmark";
import { normalizeTags } from "../models/tag";
import { BookmarkStore } from "../store/bookmarkStore";
import { TagStore } from "../store/tagStore";
import { SearchStore } from "../store/searchStore";

export interface BookmarkService {
  add(input: CreateBookmarkInput): Promise<Bookmark>;
  update(id: string, input: UpdateBookmarkInput): Promise<Bookmark | null>;
  remove(id: string): Promise<boolean>;
  getById(id: string): Promise<Bookmark | null>;
  getAll(): Promise<Bookmark[]>;
  search(query: string, tags?: string[]): Promise<Bookmark[]>;
}

export function createBookmarkService(
  bookmarkStore: BookmarkStore,
  tagStore: TagStore,
  searchStore: SearchStore
): BookmarkService {
  return {
    async add(input) {
      const normalizedTags = normalizeTags(input.tags ?? []);
      const bookmark = createBookmark({ ...input, tags: normalizedTags });
      await bookmarkStore.add(bookmark);
      await searchStore.index(bookmark);
      for (const tag of normalizedTags) {
        const existing = await tagStore.getBySlug(tag.slug);
        if (existing) {
          await tagStore.incrementCount(tag.slug);
        } else {
          await tagStore.add(tag);
        }
      }
      return bookmark;
    },

    async update(id, input) {
      const existing = await bookmarkStore.getById(id);
      if (!existing) return null;

      const normalizedInput = input.tags !== undefined
        ? { ...input, tags: normalizeTags(input.tags) }
        : input;

      const updated = updateBookmark(existing, normalizedInput);
      await bookmarkStore.update(updated);
      await searchStore.index(updated);
      return updated;
    },

    async remove(id) {
      const existing = await bookmarkStore.getById(id);
      if (!existing) return false;
      await bookmarkStore.remove(id);
      await searchStore.remove(id);
      for (const tag of existing.tags) {
        await tagStore.decrementCount(tag.slug);
      }
      return true;
    },

    async getById(id) {
      return bookmarkStore.getById(id);
    },

    async getAll() {
      return bookmarkStore.getAll();
    },

    async search(query, tags) {
      return searchStore.search(query, tags);
    },
  };
}

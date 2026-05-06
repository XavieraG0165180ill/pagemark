import { Bookmark } from "../models/bookmark";

export interface DuplicateGroup {
  url: string;
  bookmarks: Bookmark[];
}

export interface DuplicateReport {
  totalDuplicates: number;
  groups: DuplicateGroup[];
}

export interface DuplicateService {
  findDuplicates(): Promise<DuplicateReport>;
  mergeDuplicates(url: string, keepId: string): Promise<void>;
}

export interface BookmarkStoreForDuplicates {
  getAll(): Promise<Bookmark[]>;
  delete(id: string): Promise<void>;
}

export function createDuplicateService(
  bookmarkStore: BookmarkStoreForDuplicates
): DuplicateService {
  async function findDuplicates(): Promise<DuplicateReport> {
    const all = await bookmarkStore.getAll();
    const urlMap = new Map<string, Bookmark[]>();

    for (const bookmark of all) {
      const normalized = bookmark.url.trim().toLowerCase().replace(/\/$/, "");
      const existing = urlMap.get(normalized) ?? [];
      urlMap.set(normalized, [...existing, bookmark]);
    }

    const groups: DuplicateGroup[] = [];
    for (const [url, bookmarks] of urlMap.entries()) {
      if (bookmarks.length > 1) {
        groups.push({ url, bookmarks });
      }
    }

    return {
      totalDuplicates: groups.reduce((sum, g) => sum + g.bookmarks.length - 1, 0),
      groups,
    };
  }

  async function mergeDuplicates(url: string, keepId: string): Promise<void> {
    const all = await bookmarkStore.getAll();
    const normalized = url.trim().toLowerCase().replace(/\/$/, "");
    const duplicates = all.filter(
      (b) =>
        b.url.trim().toLowerCase().replace(/\/$/, "") === normalized &&
        b.id !== keepId
    );

    for (const dup of duplicates) {
      await bookmarkStore.delete(dup.id);
    }
  }

  return { findDuplicates, mergeDuplicates };
}

import { createTag, normalizeTags } from '../models/tag';

export interface TagEntry {
  slug: string;
  label: string;
  bookmarkCount: number;
  createdAt: Date;
}

export interface TagStore {
  add(label: string): TagEntry;
  getBySlug(slug: string): TagEntry | undefined;
  getAll(): TagEntry[];
  incrementCount(slug: string): void;
  decrementCount(slug: string): void;
  delete(slug: string): boolean;
  getPopular(limit?: number): TagEntry[];
}

export function createInMemoryTagStore(): TagStore {
  const tags = new Map<string, TagEntry>();

  function add(label: string): TagEntry {
    const tag = createTag(label);
    if (tags.has(tag.slug)) {
      return tags.get(tag.slug)!;
    }
    const entry: TagEntry = {
      slug: tag.slug,
      label: tag.label,
      bookmarkCount: 0,
      createdAt: new Date(),
    };
    tags.set(tag.slug, entry);
    return entry;
  }

  function getBySlug(slug: string): TagEntry | undefined {
    return tags.get(slug);
  }

  function getAll(): TagEntry[] {
    return Array.from(tags.values());
  }

  function incrementCount(slug: string): void {
    const entry = tags.get(slug);
    if (entry) {
      entry.bookmarkCount += 1;
    }
  }

  function decrementCount(slug: string): void {
    const entry = tags.get(slug);
    if (entry && entry.bookmarkCount > 0) {
      entry.bookmarkCount -= 1;
    }
  }

  function delete_(slug: string): boolean {
    return tags.delete(slug);
  }

  function getPopular(limit = 10): TagEntry[] {
    return Array.from(tags.values())
      .sort((a, b) => b.bookmarkCount - a.bookmarkCount)
      .slice(0, limit);
  }

  return {
    add,
    getBySlug,
    getAll,
    incrementCount,
    decrementCount,
    delete: delete_,
    getPopular,
  };
}

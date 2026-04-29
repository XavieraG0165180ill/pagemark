import { createInMemoryTagStore } from "../store/tagStore";
import { createInMemoryBookmarkStore } from "../store/bookmarkStore";
import { slugify, createTag, normalizeTags } from "../models/tag";
import type { Tag } from "../models/tag";

export interface TagService {
  getAll(): Promise<Tag[]>;
  getBySlug(slug: string): Promise<Tag | undefined>;
  getOrCreate(name: string): Promise<Tag>;
  mergeInto(sourceSlug: string, targetSlug: string): Promise<Tag>;
  rename(slug: string, newName: string): Promise<Tag>;
  delete(slug: string): Promise<void>;
}

export function createTagService(
  tagStore: ReturnType<typeof createInMemoryTagStore>,
  bookmarkStore: ReturnType<typeof createInMemoryBookmarkStore>
): TagService {
  async function getAll(): Promise<Tag[]> {
    return tagStore.getAll();
  }

  async function getBySlug(slug: string): Promise<Tag | undefined> {
    return tagStore.getBySlug(slug);
  }

  async function getOrCreate(name: string): Promise<Tag> {
    const [normalized] = normalizeTags([name]);
    const slug = slugify(normalized);
    const existing = await tagStore.getBySlug(slug);
    if (existing) return existing;
    const tag = createTag(normalized);
    await tagStore.add(tag);
    return tag;
  }

  async function mergeInto(sourceSlug: string, targetSlug: string): Promise<Tag> {
    const source = await tagStore.getBySlug(sourceSlug);
    const target = await tagStore.getBySlug(targetSlug);
    if (!source) throw new Error(`Tag not found: ${sourceSlug}`);
    if (!target) throw new Error(`Tag not found: ${targetSlug}`);

    const bookmarks = await bookmarkStore.getByTag(sourceSlug);
    for (const bookmark of bookmarks) {
      const updatedTags = bookmark.tags
        .filter((t) => t !== sourceSlug)
        .concat(bookmark.tags.includes(targetSlug) ? [] : [targetSlug]);
      await bookmarkStore.update({ ...bookmark, tags: updatedTags });
    }

    await tagStore.delete(sourceSlug);
    const updatedTarget = { ...target, count: target.count + source.count };
    await tagStore.update(updatedTarget);
    return updatedTarget;
  }

  async function rename(slug: string, newName: string): Promise<Tag> {
    const existing = await tagStore.getBySlug(slug);
    if (!existing) throw new Error(`Tag not found: ${slug}`);
    const newSlug = slugify(newName);
    const renamed = { ...existing, name: newName, slug: newSlug };
    const bookmarks = await bookmarkStore.getByTag(slug);
    for (const bookmark of bookmarks) {
      const updatedTags = bookmark.tags.map((t) => (t === slug ? newSlug : t));
      await bookmarkStore.update({ ...bookmark, tags: updatedTags });
    }
    await tagStore.delete(slug);
    await tagStore.add(renamed);
    return renamed;
  }

  async function deleteTag(slug: string): Promise<void> {
    const existing = await tagStore.getBySlug(slug);
    if (!existing) throw new Error(`Tag not found: ${slug}`);
    const bookmarks = await bookmarkStore.getByTag(slug);
    for (const bookmark of bookmarks) {
      const updatedTags = bookmark.tags.filter((t) => t !== slug);
      await bookmarkStore.update({ ...bookmark, tags: updatedTags });
    }
    await tagStore.delete(slug);
  }

  return { getAll, getBySlug, getOrCreate, mergeInto, rename, delete: deleteTag };
}

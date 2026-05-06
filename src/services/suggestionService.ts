import { Bookmark } from '../models/bookmark';
import { Tag } from '../models/tag';

export interface SuggestionResult {
  tags: string[];
  relatedBookmarks: string[];
}

export interface TagStore {
  getAll(): Promise<Tag[]>;
}

export interface BookmarkStore {
  getAll(): Promise<Bookmark[]>;
  getByTag(tag: string): Promise<Bookmark[]>;
}

export interface SuggestionService {
  suggestTagsForUrl(url: string): Promise<string[]>;
  suggestRelated(bookmarkId: string): Promise<SuggestionResult>;
}

export function createSuggestionService(
  bookmarkStore: BookmarkStore,
  tagStore: TagStore
): SuggestionService {
  async function suggestTagsForUrl(url: string): Promise<string[]> {
    const allBookmarks = await bookmarkStore.getAll();
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/^www\./, '');

    const domainMatches = allBookmarks.filter((b) => {
      try {
        return new URL(b.url).hostname.replace(/^www\./, '') === hostname;
      } catch {
        return false;
      }
    });

    const tagFrequency: Record<string, number> = {};
    for (const bookmark of domainMatches) {
      for (const tag of bookmark.tags) {
        tagFrequency[tag] = (tagFrequency[tag] ?? 0) + 1;
      }
    }

    return Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }

  async function suggestRelated(bookmarkId: string): Promise<SuggestionResult> {
    const allBookmarks = await bookmarkStore.getAll();
    const source = allBookmarks.find((b) => b.id === bookmarkId);

    if (!source) {
      return { tags: [], relatedBookmarks: [] };
    }

    const tagFrequency: Record<string, number> = {};
    const relatedIds = new Set<string>();

    for (const tag of source.tags) {
      const tagged = await bookmarkStore.getByTag(tag);
      for (const b of tagged) {
        if (b.id === bookmarkId) continue;
        relatedIds.add(b.id);
        for (const t of b.tags) {
          if (!source.tags.includes(t)) {
            tagFrequency[t] = (tagFrequency[t] ?? 0) + 1;
          }
        }
      }
    }

    const suggestedTags = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    return {
      tags: suggestedTags,
      relatedBookmarks: Array.from(relatedIds).slice(0, 10),
    };
  }

  return { suggestTagsForUrl, suggestRelated };
}

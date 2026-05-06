import { describe, it, expect, beforeEach } from 'vitest';
import { createSuggestionService } from './suggestionService';
import { Bookmark } from '../models/bookmark';

function makeBookmark(overrides: Partial<Bookmark>): Bookmark {
  return {
    id: 'id-1',
    url: 'https://example.com/page',
    title: 'Example',
    description: '',
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function buildService(bookmarks: Bookmark[]) {
  const bookmarkStore = {
    getAll: async () => bookmarks,
    getByTag: async (tag: string) => bookmarks.filter((b) => b.tags.includes(tag)),
  };
  const tagStore = { getAll: async () => [] };
  return createSuggestionService(bookmarkStore, tagStore);
}

describe('suggestionService', () => {
  describe('suggestTagsForUrl', () => {
    it('returns tags frequently used for same domain', async () => {
      const bookmarks = [
        makeBookmark({ id: '1', url: 'https://github.com/foo', tags: ['code', 'oss'] }),
        makeBookmark({ id: '2', url: 'https://github.com/bar', tags: ['code', 'tools'] }),
        makeBookmark({ id: '3', url: 'https://news.ycombinator.com', tags: ['news'] }),
      ];
      const service = buildService(bookmarks);
      const suggestions = await service.suggestTagsForUrl('https://github.com/baz');
      expect(suggestions).toContain('code');
      expect(suggestions).not.toContain('news');
    });

    it('returns empty array when no domain matches', async () => {
      const bookmarks = [
        makeBookmark({ id: '1', url: 'https://github.com/foo', tags: ['code'] }),
      ];
      const service = buildService(bookmarks);
      const suggestions = await service.suggestTagsForUrl('https://unknown.com/page');
      expect(suggestions).toEqual([]);
    });

    it('handles www prefix correctly', async () => {
      const bookmarks = [
        makeBookmark({ id: '1', url: 'https://www.github.com/foo', tags: ['code'] }),
      ];
      const service = buildService(bookmarks);
      const suggestions = await service.suggestTagsForUrl('https://github.com/bar');
      expect(suggestions).toContain('code');
    });
  });

  describe('suggestRelated', () => {
    it('returns related bookmark ids sharing tags', async () => {
      const bookmarks = [
        makeBookmark({ id: '1', url: 'https://a.com', tags: ['typescript', 'node'] }),
        makeBookmark({ id: '2', url: 'https://b.com', tags: ['typescript', 'react'] }),
        makeBookmark({ id: '3', url: 'https://c.com', tags: ['python'] }),
      ];
      const service = buildService(bookmarks);
      const result = await service.suggestRelated('1');
      expect(result.relatedBookmarks).toContain('2');
      expect(result.relatedBookmarks).not.toContain('1');
      expect(result.relatedBookmarks).not.toContain('3');
    });

    it('suggests new tags from related bookmarks', async () => {
      const bookmarks = [
        makeBookmark({ id: '1', url: 'https://a.com', tags: ['typescript'] }),
        makeBookmark({ id: '2', url: 'https://b.com', tags: ['typescript', 'testing'] }),
      ];
      const service = buildService(bookmarks);
      const result = await service.suggestRelated('1');
      expect(result.tags).toContain('testing');
    });

    it('returns empty result for unknown bookmark id', async () => {
      const service = buildService([]);
      const result = await service.suggestRelated('nonexistent');
      expect(result.tags).toEqual([]);
      expect(result.relatedBookmarks).toEqual([]);
    });
  });
});

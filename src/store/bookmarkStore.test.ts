import { describe, it, expect, beforeEach } from 'vitest';
import { createInMemoryBookmarkStore, BookmarkStore } from './bookmarkStore';

describe('bookmarkStore', () => {
  let store: BookmarkStore;

  beforeEach(() => {
    store = createInMemoryBookmarkStore();
  });

  it('adds a bookmark and retrieves it by id', () => {
    const bm = store.add({ url: 'https://example.com', title: 'Example', tags: [] });
    expect(store.getById(bm.id)).toEqual(bm);
  });

  it('returns undefined for unknown id', () => {
    expect(store.getById('nonexistent')).toBeUndefined();
  });

  it('getAll returns all bookmarks', () => {
    store.add({ url: 'https://a.com', title: 'A', tags: [] });
    store.add({ url: 'https://b.com', title: 'B', tags: [] });
    expect(store.getAll()).toHaveLength(2);
  });

  it('getByTag filters correctly', () => {
    store.add({ url: 'https://a.com', title: 'A', tags: ['typescript', 'dev'] });
    store.add({ url: 'https://b.com', title: 'B', tags: ['design'] });
    const results = store.getByTag('typescript');
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('A');
  });

  it('getByTag is case-insensitive', () => {
    store.add({ url: 'https://a.com', title: 'A', tags: ['TypeScript'] });
    expect(store.getByTag('typescript')).toHaveLength(1);
  });

  it('updates a bookmark', () => {
    const bm = store.add({ url: 'https://a.com', title: 'Old Title', tags: [] });
    const updated = store.update(bm.id, { title: 'New Title' });
    expect(updated?.title).toBe('New Title');
    expect(store.getById(bm.id)?.title).toBe('New Title');
  });

  it('update returns undefined for unknown id', () => {
    expect(store.update('ghost', { title: 'X' })).toBeUndefined();
  });

  it('removes a bookmark', () => {
    const bm = store.add({ url: 'https://a.com', title: 'A', tags: [] });
    expect(store.remove(bm.id)).toBe(true);
    expect(store.getById(bm.id)).toBeUndefined();
  });

  it('remove returns false for unknown id', () => {
    expect(store.remove('ghost')).toBe(false);
  });

  it('search matches title, url, description, and tags', () => {
    store.add({ url: 'https://github.com', title: 'GitHub', tags: ['git'], description: 'code hosting' });
    store.add({ url: 'https://figma.com', title: 'Figma', tags: ['design'], description: 'UI tool' });
    expect(store.search('git')).toHaveLength(1);
    expect(store.search('hosting')).toHaveLength(1);
    expect(store.search('design')).toHaveLength(1);
    expect(store.search('')).toHaveLength(2);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { createInMemoryBookmarkStore } from './bookmarkStore';
import { createInMemorySearchStore } from './searchStore';
import { createBookmark } from '../models/bookmark';

describe('searchStore', () => {
  let bookmarkStore: ReturnType<typeof createInMemoryBookmarkStore>;
  let searchStore: ReturnType<typeof createInMemorySearchStore>;

  beforeEach(async () => {
    bookmarkStore = createInMemoryBookmarkStore();
    searchStore = createInMemorySearchStore(bookmarkStore);

    await bookmarkStore.add(createBookmark({ title: 'TypeScript Handbook', url: 'https://typescriptlang.org', tags: ['typescript', 'docs'] }));
    await bookmarkStore.add(createBookmark({ title: 'React Docs', url: 'https://react.dev', tags: ['react', 'docs'], collectionId: 'col-1' }));
    await bookmarkStore.add(createBookmark({ title: 'Node.js Guide', url: 'https://nodejs.org', tags: ['nodejs', 'backend'], description: 'Official Node.js documentation' }));
    await bookmarkStore.add(createBookmark({ title: 'Vite Build Tool', url: 'https://vitejs.dev', tags: ['vite', 'build'], collectionId: 'col-1' }));
  });

  it('returns all bookmarks when no options provided', async () => {
    const result = await searchStore.search({});
    expect(result.total).toBe(4);
    expect(result.bookmarks).toHaveLength(4);
  });

  it('filters by title query', async () => {
    const result = await searchStore.search({ query: 'typescript' });
    expect(result.total).toBe(1);
    expect(result.bookmarks[0].title).toBe('TypeScript Handbook');
  });

  it('filters by url query', async () => {
    const result = await searchStore.search({ query: 'vitejs' });
    expect(result.total).toBe(1);
    expect(result.bookmarks[0].title).toBe('Vite Build Tool');
  });

  it('filters by description query', async () => {
    const result = await searchStore.search({ query: 'official node' });
    expect(result.total).toBe(1);
    expect(result.bookmarks[0].title).toBe('Node.js Guide');
  });

  it('filters by single tag', async () => {
    const result = await searchStore.search({ tags: ['docs'] });
    expect(result.total).toBe(2);
  });

  it('filters by multiple tags (AND logic)', async () => {
    const result = await searchStore.search({ tags: ['react', 'docs'] });
    expect(result.total).toBe(1);
    expect(result.bookmarks[0].title).toBe('React Docs');
  });

  it('filters by collectionId', async () => {
    const result = await searchStore.search({ collectionId: 'col-1' });
    expect(result.total).toBe(2);
  });

  it('applies pagination with limit and offset', async () => {
    const result = await searchStore.search({ limit: 2, offset: 1 });
    expect(result.total).toBe(4);
    expect(result.bookmarks).toHaveLength(2);
  });

  it('returns empty results when no matches', async () => {
    const result = await searchStore.search({ query: 'nonexistent' });
    expect(result.total).toBe(0);
    expect(result.bookmarks).toHaveLength(0);
  });

  it('combines query and tag filters', async () => {
    const result = await searchStore.search({ query: 'docs', tags: ['react'] });
    expect(result.total).toBe(1);
    expect(result.bookmarks[0].title).toBe('React Docs');
  });
});

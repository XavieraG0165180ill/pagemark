import { describe, it, expect, beforeEach } from 'vitest';
import { createCollectionService } from './collectionService';
import { createInMemoryCollectionStore } from '../store/collectionStore';
import { createInMemoryBookmarkStore } from '../store/bookmarkStore';
import { createBookmark } from '../models/bookmark';

function buildService() {
  const collectionStore = createInMemoryCollectionStore();
  const bookmarkStore = createInMemoryBookmarkStore();
  const service = createCollectionService(collectionStore, bookmarkStore);
  return { service, collectionStore, bookmarkStore };
}

describe('collectionService', () => {
  it('creates a collection', () => {
    const { service } = buildService();
    const col = service.createCollection('Reading List', 'Articles to read');
    expect(col.name).toBe('Reading List');
    expect(col.description).toBe('Articles to read');
    expect(col.slug).toBe('reading-list');
  });

  it('retrieves all collections', () => {
    const { service } = buildService();
    service.createCollection('Work');
    service.createCollection('Personal');
    expect(service.getAllCollections()).toHaveLength(2);
  });

  it('updates a collection', () => {
    const { service } = buildService();
    const col = service.createCollection('Old Name');
    const updated = service.updateCollection(col.id, { name: 'New Name' });
    expect(updated.name).toBe('New Name');
    expect(service.getCollection(col.id)?.name).toBe('New Name');
  });

  it('throws when updating non-existent collection', () => {
    const { service } = buildService();
    expect(() => service.updateCollection('missing-id', { name: 'X' })).toThrow();
  });

  it('deletes a collection', () => {
    const { service } = buildService();
    const col = service.createCollection('Temp');
    service.deleteCollection(col.id);
    expect(service.getCollection(col.id)).toBeUndefined();
  });

  it('adds a bookmark to a collection', () => {
    const { service, bookmarkStore } = buildService();
    const bookmark = createBookmark('https://example.com', 'Example');
    bookmarkStore.add(bookmark);
    const col = service.createCollection('Favs');
    const updated = service.addBookmark(col.id, bookmark.id);
    expect(updated.bookmarkIds).toContain(bookmark.id);
  });

  it('throws when adding bookmark to missing collection', () => {
    const { service, bookmarkStore } = buildService();
    const bookmark = createBookmark('https://example.com', 'Example');
    bookmarkStore.add(bookmark);
    expect(() => service.addBookmark('no-col', bookmark.id)).toThrow();
  });

  it('throws when adding missing bookmark to collection', () => {
    const { service } = buildService();
    const col = service.createCollection('Test');
    expect(() => service.addBookmark(col.id, 'no-bookmark')).toThrow();
  });

  it('removes a bookmark from a collection', () => {
    const { service, bookmarkStore } = buildService();
    const bookmark = createBookmark('https://example.com', 'Example');
    bookmarkStore.add(bookmark);
    const col = service.createCollection('Favs');
    service.addBookmark(col.id, bookmark.id);
    const updated = service.removeBookmark(col.id, bookmark.id);
    expect(updated.bookmarkIds).not.toContain(bookmark.id);
  });

  it('returns bookmark ids in collection', () => {
    const { service, bookmarkStore } = buildService();
    const b1 = createBookmark('https://a.com', 'A');
    const b2 = createBookmark('https://b.com', 'B');
    bookmarkStore.add(b1);
    bookmarkStore.add(b2);
    const col = service.createCollection('Mixed');
    service.addBookmark(col.id, b1.id);
    service.addBookmark(col.id, b2.id);
    const ids = service.getBookmarksInCollection(col.id);
    expect(ids).toHaveLength(2);
    expect(ids).toContain(b1.id);
  });
});

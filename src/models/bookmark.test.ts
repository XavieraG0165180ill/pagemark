import { describe, it, expect, beforeEach } from 'vitest';
import {
  createBookmark,
  updateBookmark,
  type Bookmark,
  type CreateBookmarkInput,
} from './bookmark';

describe('createBookmark', () => {
  const input: CreateBookmarkInput = {
    url: 'https://example.com',
    title: 'Example Site',
    description: 'A test bookmark',
    tags: ['test', 'example'],
  };

  it('should create a bookmark with a unique id', () => {
    const b1 = createBookmark(input);
    const b2 = createBookmark(input);
    expect(b1.id).toBeDefined();
    expect(b1.id).not.toBe(b2.id);
  });

  it('should set createdAt and updatedAt to the same time', () => {
    const bookmark = createBookmark(input);
    expect(bookmark.createdAt).toEqual(bookmark.updatedAt);
  });

  it('should default tags to an empty array when not provided', () => {
    const bookmark = createBookmark({ url: 'https://example.com', title: 'Test' });
    expect(bookmark.tags).toEqual([]);
  });

  it('should include all provided fields', () => {
    const bookmark = createBookmark(input);
    expect(bookmark.url).toBe(input.url);
    expect(bookmark.title).toBe(input.title);
    expect(bookmark.description).toBe(input.description);
    expect(bookmark.tags).toEqual(input.tags);
  });
});

describe('updateBookmark', () => {
  let bookmark: Bookmark;

  beforeEach(() => {
    bookmark = createBookmark({
      url: 'https://example.com',
      title: 'Original Title',
      tags: ['original'],
    });
  });

  it('should update only the provided fields', () => {
    const updated = updateBookmark(bookmark, { title: 'New Title' });
    expect(updated.title).toBe('New Title');
    expect(updated.url).toBe(bookmark.url);
    expect(updated.tags).toEqual(bookmark.tags);
  });

  it('should update the updatedAt timestamp', async () => {
    await new Promise((r) => setTimeout(r, 5));
    const updated = updateBookmark(bookmark, { title: 'New Title' });
    expect(updated.updatedAt.getTime()).toBeGreaterThan(
      bookmark.updatedAt.getTime()
    );
  });

  it('should not change the id or createdAt', () => {
    const updated = updateBookmark(bookmark, { tags: ['new-tag'] });
    expect(updated.id).toBe(bookmark.id);
    expect(updated.createdAt).toEqual(bookmark.createdAt);
  });

  it('should ignore undefined values in the update input', () => {
    const updated = updateBookmark(bookmark, { description: undefined });
    expect(updated.description).toBeUndefined();
  });
});

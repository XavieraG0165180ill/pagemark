import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInMemoryBookmarkVersionStore,
  createBookmarkVersionService,
  BookmarkVersionService,
} from './bookmarkVersionService';

function buildService(): BookmarkVersionService {
  const store = createInMemoryBookmarkVersionStore();
  return createBookmarkVersionService(store);
}

const sampleBookmark = {
  id: 'bm_001',
  title: 'Example Site',
  url: 'https://example.com',
  description: 'An example',
  tags: ['web', 'example'],
};

describe('bookmarkVersionService', () => {
  let service: BookmarkVersionService;

  beforeEach(() => {
    service = buildService();
  });

  it('creates a version snapshot with version number 1', () => {
    const version = service.snapshot(sampleBookmark);
    expect(version.bookmarkId).toBe('bm_001');
    expect(version.title).toBe('Example Site');
    expect(version.version).toBe(1);
    expect(version.id).toMatch(/^ver_/);
    expect(version.savedAt).toBeTruthy();
  });

  it('increments version number on subsequent snapshots', () => {
    service.snapshot(sampleBookmark);
    const v2 = service.snapshot({ ...sampleBookmark, title: 'Updated Title' });
    expect(v2.version).toBe(2);
    expect(v2.title).toBe('Updated Title');
  });

  it('returns full history for a bookmark', () => {
    service.snapshot(sampleBookmark);
    service.snapshot({ ...sampleBookmark, title: 'V2' });
    service.snapshot({ ...sampleBookmark, title: 'V3' });
    const history = service.getHistory('bm_001');
    expect(history).toHaveLength(3);
    expect(history.map((v) => v.version)).toEqual([1, 2, 3]);
  });

  it('returns empty history for unknown bookmark', () => {
    const history = service.getHistory('bm_unknown');
    expect(history).toEqual([]);
  });

  it('returns the latest version', () => {
    service.snapshot(sampleBookmark);
    service.snapshot({ ...sampleBookmark, title: 'Latest' });
    const latest = service.getLatest('bm_001');
    expect(latest?.title).toBe('Latest');
    expect(latest?.version).toBe(2);
  });

  it('returns undefined latest for unknown bookmark', () => {
    expect(service.getLatest('bm_unknown')).toBeUndefined();
  });

  it('stores tags as a copy to avoid mutation', () => {
    const tags = ['a', 'b'];
    const version = service.snapshot({ ...sampleBookmark, tags });
    tags.push('c');
    expect(version.tags).toEqual(['a', 'b']);
  });

  it('isolates history per bookmark', () => {
    service.snapshot(sampleBookmark);
    service.snapshot({ ...sampleBookmark, id: 'bm_002', url: 'https://other.com' });
    expect(service.getHistory('bm_001')).toHaveLength(1);
    expect(service.getHistory('bm_002')).toHaveLength(1);
  });
});

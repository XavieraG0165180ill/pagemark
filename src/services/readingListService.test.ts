import { createInMemoryReadingListStore, createReadingListService } from './readingListService';
import { createBookmark } from '../models/bookmark';

function buildService() {
  const store = createInMemoryReadingListStore();
  const service = createReadingListService(store);
  return { store, service };
}

const sampleBookmark = createBookmark({
  url: 'https://example.com',
  title: 'Example',
  tags: [],
});

describe('readingListService', () => {
  it('adds a bookmark to the reading list', async () => {
    const { service } = buildService();
    const entry = await service.add(sampleBookmark.id, sampleBookmark.url, sampleBookmark.title);
    expect(entry.bookmarkId).toBe(sampleBookmark.id);
    expect(entry.read).toBe(false);
  });

  it('returns all reading list entries', async () => {
    const { service } = buildService();
    await service.add('id1', 'https://a.com', 'A');
    await service.add('id2', 'https://b.com', 'B');
    const all = await service.getAll();
    expect(all).toHaveLength(2);
  });

  it('marks an entry as read', async () => {
    const { service } = buildService();
    const entry = await service.add(sampleBookmark.id, sampleBookmark.url, sampleBookmark.title);
    const updated = await service.markAsRead(entry.id);
    expect(updated?.read).toBe(true);
    expect(updated?.readAt).toBeDefined();
  });

  it('removes an entry from the reading list', async () => {
    const { service } = buildService();
    const entry = await service.add(sampleBookmark.id, sampleBookmark.url, sampleBookmark.title);
    await service.remove(entry.id);
    const all = await service.getAll();
    expect(all).toHaveLength(0);
  });

  it('returns only unread entries', async () => {
    const { service } = buildService();
    const e1 = await service.add('id1', 'https://a.com', 'A');
    await service.add('id2', 'https://b.com', 'B');
    await service.markAsRead(e1.id);
    const unread = await service.getUnread();
    expect(unread).toHaveLength(1);
    expect(unread[0].bookmarkId).toBe('id2');
  });

  it('returns null when marking non-existent entry as read', async () => {
    const { service } = buildService();
    const result = await service.markAsRead('nonexistent');
    expect(result).toBeNull();
  });
});

import { createInMemoryReminderStore, createReminderService } from './reminderService';
import { createBookmark } from '../models/bookmark';

function buildService() {
  const store = createInMemoryReminderStore();
  const service = createReminderService(store);
  return { store, service };
}

const sampleBookmark = createBookmark({
  url: 'https://example.com',
  title: 'Example',
  tags: [],
});

describe('reminderService', () => {
  it('creates a reminder for a bookmark', async () => {
    const { service } = buildService();
    const remindAt = new Date(Date.now() + 60_000).toISOString();
    const reminder = await service.create(sampleBookmark.id, remindAt, 'Check this later');
    expect(reminder.bookmarkId).toBe(sampleBookmark.id);
    expect(reminder.note).toBe('Check this later');
    expect(reminder.dismissed).toBe(false);
  });

  it('lists all reminders', async () => {
    const { service } = buildService();
    const remindAt = new Date(Date.now() + 60_000).toISOString();
    await service.create(sampleBookmark.id, remindAt);
    await service.create(sampleBookmark.id, remindAt);
    const all = await service.getAll();
    expect(all).toHaveLength(2);
  });

  it('gets due reminders', async () => {
    const { service } = buildService();
    const past = new Date(Date.now() - 1000).toISOString();
    const future = new Date(Date.now() + 60_000).toISOString();
    await service.create(sampleBookmark.id, past, 'overdue');
    await service.create(sampleBookmark.id, future, 'not yet');
    const due = await service.getDue();
    expect(due).toHaveLength(1);
    expect(due[0].note).toBe('overdue');
  });

  it('dismisses a reminder', async () => {
    const { service } = buildService();
    const remindAt = new Date(Date.now() - 1000).toISOString();
    const reminder = await service.create(sampleBookmark.id, remindAt);
    await service.dismiss(reminder.id);
    const due = await service.getDue();
    expect(due).toHaveLength(0);
  });

  it('deletes a reminder', async () => {
    const { service } = buildService();
    const remindAt = new Date(Date.now() + 60_000).toISOString();
    const reminder = await service.create(sampleBookmark.id, remindAt);
    await service.delete(reminder.id);
    const all = await service.getAll();
    expect(all).toHaveLength(0);
  });

  it('returns reminders for a specific bookmark', async () => {
    const { service } = buildService();
    const other = createBookmark({ url: 'https://other.com', title: 'Other', tags: [] });
    const remindAt = new Date(Date.now() + 60_000).toISOString();
    await service.create(sampleBookmark.id, remindAt);
    await service.create(other.id, remindAt);
    const forBookmark = await service.getByBookmark(sampleBookmark.id);
    expect(forBookmark).toHaveLength(1);
    expect(forBookmark[0].bookmarkId).toBe(sampleBookmark.id);
  });
});

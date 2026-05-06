import Fastify from 'fastify';
import express from 'express';
import request from 'supertest';
import { createInMemoryReminderStore, createReminderService } from '../services/reminderService';
import { createReminderRouter } from './reminderRoutes';
import { createBookmark } from '../models/bookmark';

function buildApp() {
  const app = express();
  app.use(express.json());
  const store = createInMemoryReminderStore();
  const service = createReminderService(store);
  app.use('/reminders', createReminderRouter(service));
  return { app, service };
}

const bookmark = createBookmark({ url: 'https://example.com', title: 'Example', tags: [] });

describe('reminderRoutes', () => {
  it('GET /reminders returns empty array', async () => {
    const { app } = buildApp();
    const res = await request(app).get('/reminders');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('POST /reminders creates a reminder', async () => {
    const { app } = buildApp();
    const remindAt = new Date(Date.now() + 60_000).toISOString();
    const res = await request(app)
      .post('/reminders')
      .send({ bookmarkId: bookmark.id, remindAt, note: 'Read later' });
    expect(res.status).toBe(201);
    expect(res.body.bookmarkId).toBe(bookmark.id);
    expect(res.body.note).toBe('Read later');
  });

  it('POST /reminders returns 400 when bookmarkId missing', async () => {
    const { app } = buildApp();
    const res = await request(app)
      .post('/reminders')
      .send({ remindAt: new Date().toISOString() });
    expect(res.status).toBe(400);
  });

  it('GET /reminders/due returns only due reminders', async () => {
    const { app, service } = buildApp();
    const past = new Date(Date.now() - 1000).toISOString();
    const future = new Date(Date.now() + 60_000).toISOString();
    await service.create(bookmark.id, past, 'overdue');
    await service.create(bookmark.id, future, 'future');
    const res = await request(app).get('/reminders/due');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].note).toBe('overdue');
  });

  it('POST /reminders/:id/dismiss dismisses a reminder', async () => {
    const { app, service } = buildApp();
    const past = new Date(Date.now() - 1000).toISOString();
    const reminder = await service.create(bookmark.id, past);
    const res = await request(app).post(`/reminders/${reminder.id}/dismiss`);
    expect(res.status).toBe(204);
    const due = await service.getDue();
    expect(due).toHaveLength(0);
  });

  it('DELETE /reminders/:id removes a reminder', async () => {
    const { app, service } = buildApp();
    const remindAt = new Date(Date.now() + 60_000).toISOString();
    const reminder = await service.create(bookmark.id, remindAt);
    const res = await request(app).delete(`/reminders/${reminder.id}`);
    expect(res.status).toBe(204);
    const all = await service.getAll();
    expect(all).toHaveLength(0);
  });

  it('GET /reminders/bookmark/:bookmarkId filters correctly', async () => {
    const { app, service } = buildApp();
    const other = createBookmark({ url: 'https://other.com', title: 'Other', tags: [] });
    const remindAt = new Date(Date.now() + 60_000).toISOString();
    await service.create(bookmark.id, remindAt);
    await service.create(other.id, remindAt);
    const res = await request(app).get(`/reminders/bookmark/${bookmark.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

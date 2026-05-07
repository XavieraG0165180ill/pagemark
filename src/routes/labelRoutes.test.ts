import { describe, it, expect, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createInMemoryLabelStore, createLabelService } from '../services/labelService';
import { createLabelRouter } from './labelRoutes';

function buildApp() {
  const store = createInMemoryLabelStore();
  const service = createLabelService(store);
  const app = express();
  app.use(express.json());
  app.use('/labels', createLabelRouter(service));
  return { app, service };
}

describe('GET /labels', () => {
  it('returns empty array initially', async () => {
    const { app } = buildApp();
    const res = await request(app).get('/labels');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('POST /labels', () => {
  it('creates a label', async () => {
    const { app } = buildApp();
    const res = await request(app).post('/labels').send({ name: 'Work', color: '#ff0000' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Work');
  });

  it('returns 400 if name is missing', async () => {
    const { app } = buildApp();
    const res = await request(app).post('/labels').send({ color: '#fff' });
    expect(res.status).toBe(400);
  });
});

describe('GET /labels/:id', () => {
  it('returns a label by id', async () => {
    const { app, service } = buildApp();
    const label = service.createLabel('Test', '#123456');
    const res = await request(app).get(`/labels/${label.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(label.id);
  });

  it('returns 404 for unknown id', async () => {
    const { app } = buildApp();
    const res = await request(app).get('/labels/unknown');
    expect(res.status).toBe(404);
  });
});

describe('PATCH /labels/:id', () => {
  it('updates a label', async () => {
    const { app, service } = buildApp();
    const label = service.createLabel('Old', '#000');
    const res = await request(app).patch(`/labels/${label.id}`).send({ name: 'New' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New');
  });
});

describe('DELETE /labels/:id', () => {
  it('deletes a label', async () => {
    const { app, service } = buildApp();
    const label = service.createLabel('Del', '#fff');
    const res = await request(app).delete(`/labels/${label.id}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 for unknown id', async () => {
    const { app } = buildApp();
    const res = await request(app).delete('/labels/bad');
    expect(res.status).toBe(404);
  });
});

describe('label assignment routes', () => {
  it('assigns and retrieves a label for a bookmark', async () => {
    const { app, service } = buildApp();
    const label = service.createLabel('Fav', '#gold');
    await request(app).post(`/labels/bookmark/bm1/assign/${label.id}`);
    const res = await request(app).get('/labels/bookmark/bm1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

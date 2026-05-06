import { describe, it, expect, beforeEach } from 'vitest';
import fastify, { FastifyInstance } from 'fastify';
import express from 'express';
import request from 'supertest';
import { createSuggestionRouter } from './suggestionRoutes';
import { SuggestionService } from '../services/suggestionService';

function buildApp(service: Partial<SuggestionService>) {
  const app = express();
  app.use(express.json());
  app.use(createSuggestionRouter(service as SuggestionService));
  return app;
}

describe('GET /suggestions/tags', () => {
  it('returns suggested tags for a valid url', async () => {
    const app = buildApp({
      suggestTagsForUrl: async () => ['code', 'oss'],
    });
    const res = await request(app)
      .get('/suggestions/tags')
      .query({ url: 'https://github.com/foo' });
    expect(res.status).toBe(200);
    expect(res.body.tags).toEqual(['code', 'oss']);
  });

  it('returns 400 when url is missing', async () => {
    const app = buildApp({ suggestTagsForUrl: async () => [] });
    const res = await request(app).get('/suggestions/tags');
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/url/);
  });

  it('returns 400 for an invalid url', async () => {
    const app = buildApp({ suggestTagsForUrl: async () => [] });
    const res = await request(app)
      .get('/suggestions/tags')
      .query({ url: 'not-a-url' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid URL/);
  });
});

describe('GET /suggestions/related/:id', () => {
  it('returns related bookmarks and tags', async () => {
    const mockResult = { tags: ['testing'], relatedBookmarks: ['id-2'] };
    const app = buildApp({
      suggestRelated: async () => mockResult,
    });
    const res = await request(app).get('/suggestions/related/id-1');
    expect(res.status).toBe(200);
    expect(res.body.tags).toContain('testing');
    expect(res.body.relatedBookmarks).toContain('id-2');
  });

  it('returns empty result for unknown id', async () => {
    const app = buildApp({
      suggestRelated: async () => ({ tags: [], relatedBookmarks: [] }),
    });
    const res = await request(app).get('/suggestions/related/unknown');
    expect(res.status).toBe(200);
    expect(res.body.tags).toEqual([]);
    expect(res.body.relatedBookmarks).toEqual([]);
  });
});

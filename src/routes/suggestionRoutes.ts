import { Router, Request, Response } from 'express';
import { SuggestionService } from '../services/suggestionService';

export function createSuggestionRouter(suggestionService: SuggestionService): Router {
  const router = Router();

  router.get('/suggestions/tags', async (req: Request, res: Response) => {
    const url = req.query.url as string | undefined;
    if (!url) {
      return res.status(400).json({ error: 'url query parameter is required' });
    }
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL' });
    }
    const tags = await suggestionService.suggestTagsForUrl(url);
    return res.json({ tags });
  });

  router.get('/suggestions/related/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await suggestionService.suggestRelated(id);
    return res.json(result);
  });

  return router;
}

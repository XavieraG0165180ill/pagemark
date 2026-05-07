import { Router } from 'express';
import { LabelService } from '../services/labelService';

export function createLabelRouter(service: LabelService): Router {
  const router = Router();

  // In-process assignment store (per router instance)
  const assignments = new Map<string, Set<string>>();

  router.get('/', (_req, res) => {
    res.json(service.listLabels());
  });

  router.post('/', (req, res) => {
    const { name, color } = req.body;
    if (!name || !color) {
      return res.status(400).json({ error: 'name and color are required' });
    }
    const label = service.createLabel(name, color);
    res.status(201).json(label);
  });

  router.get('/:id', (req, res) => {
    const label = service.getLabel(req.params.id);
    if (!label) return res.status(404).json({ error: 'Label not found' });
    res.json(label);
  });

  router.patch('/:id', (req, res) => {
    const { name, color } = req.body;
    const updated = service.updateLabel(req.params.id, { name, color });
    if (!updated) return res.status(404).json({ error: 'Label not found' });
    res.json(updated);
  });

  router.delete('/:id', (req, res) => {
    const deleted = service.deleteLabel(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Label not found' });
    res.status(204).send();
  });

  router.get('/bookmark/:bookmarkId', (req, res) => {
    const labels = service.getLabelsForBookmark(req.params.bookmarkId, assignments);
    res.json(labels);
  });

  router.post('/bookmark/:bookmarkId/assign/:labelId', (req, res) => {
    const { bookmarkId, labelId } = req.params;
    if (!service.getLabel(labelId)) {
      return res.status(404).json({ error: 'Label not found' });
    }
    service.assignLabel(bookmarkId, labelId, assignments);
    res.status(204).send();
  });

  router.delete('/bookmark/:bookmarkId/assign/:labelId', (req, res) => {
    const { bookmarkId, labelId } = req.params;
    service.removeLabel(bookmarkId, labelId, assignments);
    res.status(204).send();
  });

  return router;
}

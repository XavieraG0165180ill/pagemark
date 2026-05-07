import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInMemoryLabelStore,
  createLabelService,
  LabelService,
} from './labelService';

function buildService() {
  const store = createInMemoryLabelStore();
  const service = createLabelService(store);
  return { service };
}

describe('labelService', () => {
  let service: LabelService;

  beforeEach(() => {
    ({ service } = buildService());
  });

  it('creates a label with id and createdAt', () => {
    const label = service.createLabel('Work', '#ff0000');
    expect(label.id).toMatch(/^label_/);
    expect(label.name).toBe('Work');
    expect(label.color).toBe('#ff0000');
    expect(label.createdAt).toBeTruthy();
  });

  it('retrieves a label by id', () => {
    const label = service.createLabel('Personal', '#00ff00');
    expect(service.getLabel(label.id)).toEqual(label);
  });

  it('returns undefined for unknown id', () => {
    expect(service.getLabel('nonexistent')).toBeUndefined();
  });

  it('lists all labels', () => {
    service.createLabel('A', '#aaa');
    service.createLabel('B', '#bbb');
    expect(service.listLabels()).toHaveLength(2);
  });

  it('updates a label', () => {
    const label = service.createLabel('Old', '#111');
    const updated = service.updateLabel(label.id, { name: 'New', color: '#222' });
    expect(updated?.name).toBe('New');
    expect(updated?.color).toBe('#222');
  });

  it('returns undefined when updating non-existent label', () => {
    expect(service.updateLabel('bad', { name: 'X' })).toBeUndefined();
  });

  it('deletes a label', () => {
    const label = service.createLabel('ToDelete', '#000');
    expect(service.deleteLabel(label.id)).toBe(true);
    expect(service.getLabel(label.id)).toBeUndefined();
  });

  it('assigns and retrieves labels for a bookmark', () => {
    const label = service.createLabel('Tag', '#abc');
    const assignments = new Map<string, Set<string>>();
    service.assignLabel('bm1', label.id, assignments);
    const labels = service.getLabelsForBookmark('bm1', assignments);
    expect(labels).toHaveLength(1);
    expect(labels[0].id).toBe(label.id);
  });

  it('removes a label assignment', () => {
    const label = service.createLabel('Tag', '#abc');
    const assignments = new Map<string, Set<string>>();
    service.assignLabel('bm1', label.id, assignments);
    service.removeLabel('bm1', label.id, assignments);
    expect(service.getLabelsForBookmark('bm1', assignments)).toHaveLength(0);
  });
});

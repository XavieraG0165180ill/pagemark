import { Bookmark } from '../models/bookmark';

export interface Label {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface LabelStore {
  add(label: Label): void;
  getById(id: string): Label | undefined;
  getAll(): Label[];
  update(id: string, changes: Partial<Label>): Label | undefined;
  remove(id: string): boolean;
}

export function generateLabelId(): string {
  return `label_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createInMemoryLabelStore(): LabelStore {
  const store = new Map<string, Label>();
  return {
    add(label) { store.set(label.id, label); },
    getById(id) { return store.get(id); },
    getAll() { return Array.from(store.values()); },
    update(id, changes) {
      const existing = store.get(id);
      if (!existing) return undefined;
      const updated = { ...existing, ...changes };
      store.set(id, updated);
      return updated;
    },
    remove(id) {
      return store.delete(id);
    },
  };
}

export interface LabelService {
  createLabel(name: string, color: string): Label;
  getLabel(id: string): Label | undefined;
  listLabels(): Label[];
  updateLabel(id: string, changes: Partial<Pick<Label, 'name' | 'color'>>): Label | undefined;
  deleteLabel(id: string): boolean;
  getBookmarksByLabel(labelId: string, bookmarks: Bookmark[]): Bookmark[];
  assignLabel(bookmarkId: string, labelId: string, assignments: Map<string, Set<string>>): void;
  removeLabel(bookmarkId: string, labelId: string, assignments: Map<string, Set<string>>): void;
  getLabelsForBookmark(bookmarkId: string, assignments: Map<string, Set<string>>): Label[];
}

export function createLabelService(store: LabelStore): LabelService {
  return {
    createLabel(name, color) {
      const label: Label = { id: generateLabelId(), name, color, createdAt: new Date().toISOString() };
      store.add(label);
      return label;
    },
    getLabel(id) { return store.getById(id); },
    listLabels() { return store.getAll(); },
    updateLabel(id, changes) { return store.update(id, changes); },
    deleteLabel(id) { return store.remove(id); },
    getBookmarksByLabel(labelId, bookmarks) {
      return bookmarks.filter(b => (b as any).labelIds?.includes(labelId));
    },
    assignLabel(bookmarkId, labelId, assignments) {
      if (!assignments.has(bookmarkId)) assignments.set(bookmarkId, new Set());
      assignments.get(bookmarkId)!.add(labelId);
    },
    removeLabel(bookmarkId, labelId, assignments) {
      assignments.get(bookmarkId)?.delete(labelId);
    },
    getLabelsForBookmark(bookmarkId, assignments) {
      const ids = assignments.get(bookmarkId) ?? new Set<string>();
      return Array.from(ids).map(id => store.getById(id)).filter((l): l is Label => !!l);
    },
  };
}

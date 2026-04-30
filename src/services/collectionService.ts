import { createCollection, updateCollection, addBookmarkToCollection, removeBookmarkFromCollection } from '../models/collection';
import { createInMemoryCollectionStore } from '../store/collectionStore';
import { createInMemoryBookmarkStore } from '../store/bookmarkStore';
import type { Collection } from '../models/collection';

export interface CollectionService {
  createCollection(name: string, description?: string): Collection;
  updateCollection(id: string, updates: Partial<Pick<Collection, 'name' | 'description'>>): Collection;
  deleteCollection(id: string): void;
  getCollection(id: string): Collection | undefined;
  getAllCollections(): Collection[];
  addBookmark(collectionId: string, bookmarkId: string): Collection;
  removeBookmark(collectionId: string, bookmarkId: string): Collection;
  getBookmarksInCollection(collectionId: string): string[];
}

export function createCollectionService(
  collectionStore: ReturnType<typeof createInMemoryCollectionStore>,
  bookmarkStore: ReturnType<typeof createInMemoryBookmarkStore>
): CollectionService {
  return {
    createCollection(name, description) {
      const collection = createCollection(name, description);
      collectionStore.add(collection);
      return collection;
    },

    updateCollection(id, updates) {
      const existing = collectionStore.getById(id);
      if (!existing) throw new Error(`Collection not found: ${id}`);
      const updated = updateCollection(existing, updates);
      collectionStore.update(updated);
      return updated;
    },

    deleteCollection(id) {
      const existing = collectionStore.getById(id);
      if (!existing) throw new Error(`Collection not found: ${id}`);
      collectionStore.remove(id);
    },

    getCollection(id) {
      return collectionStore.getById(id);
    },

    getAllCollections() {
      return collectionStore.getAll();
    },

    addBookmark(collectionId, bookmarkId) {
      const collection = collectionStore.getById(collectionId);
      if (!collection) throw new Error(`Collection not found: ${collectionId}`);
      const bookmark = bookmarkStore.getById(bookmarkId);
      if (!bookmark) throw new Error(`Bookmark not found: ${bookmarkId}`);
      const updated = addBookmarkToCollection(collection, bookmarkId);
      collectionStore.update(updated);
      return updated;
    },

    removeBookmark(collectionId, bookmarkId) {
      const collection = collectionStore.getById(collectionId);
      if (!collection) throw new Error(`Collection not found: ${collectionId}`);
      const updated = removeBookmarkFromCollection(collection, bookmarkId);
      collectionStore.update(updated);
      return updated;
    },

    getBookmarksInCollection(collectionId) {
      const collection = collectionStore.getById(collectionId);
      if (!collection) throw new Error(`Collection not found: ${collectionId}`);
      return collection.bookmarkIds;
    },
  };
}

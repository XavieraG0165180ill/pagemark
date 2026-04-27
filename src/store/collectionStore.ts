import {
  Collection,
  CreateCollectionInput,
  UpdateCollectionInput,
  createCollection,
  updateCollection,
  addBookmarkToCollection,
  removeBookmarkFromCollection,
} from "../models/collection";

export interface CollectionStore {
  getAll(): Collection[];
  getById(id: string): Collection | undefined;
  getBySlug(slug: string): Collection | undefined;
  create(input: CreateCollectionInput): Collection;
  update(id: string, input: UpdateCollectionInput): Collection;
  delete(id: string): boolean;
  addBookmark(collectionId: string, bookmarkId: string): Collection;
  removeBookmark(collectionId: string, bookmarkId: string): Collection;
}

export function createInMemoryCollectionStore(): CollectionStore {
  const store = new Map<string, Collection>();

  return {
    getAll(): Collection[] {
      return Array.from(store.values()).sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    },

    getById(id: string): Collection | undefined {
      return store.get(id);
    },

    getBySlug(slug: string): Collection | undefined {
      return Array.from(store.values()).find((c) => c.slug === slug);
    },

    create(input: CreateCollectionInput): Collection {
      const collection = createCollection(input);
      store.set(collection.id, collection);
      return collection;
    },

    update(id: string, input: UpdateCollectionInput): Collection {
      const existing = store.get(id);
      if (!existing) {
        throw new Error(`Collection not found: ${id}`);
      }
      const updated = updateCollection(existing, input);
      store.set(id, updated);
      return updated;
    },

    delete(id: string): boolean {
      return store.delete(id);
    },

    addBookmark(collectionId: string, bookmarkId: string): Collection {
      const existing = store.get(collectionId);
      if (!existing) {
        throw new Error(`Collection not found: ${collectionId}`);
      }
      const updated = addBookmarkToCollection(existing, bookmarkId);
      store.set(collectionId, updated);
      return updated;
    },

    removeBookmark(collectionId: string, bookmarkId: string): Collection {
      const existing = store.get(collectionId);
      if (!existing) {
        throw new Error(`Collection not found: ${collectionId}`);
      }
      const updated = removeBookmarkFromCollection(existing, bookmarkId);
      store.set(collectionId, updated);
      return updated;
    },
  };
}

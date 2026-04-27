export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  bookmarkIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCollectionInput {
  name: string;
  description?: string;
}

export interface UpdateCollectionInput {
  name?: string;
  description?: string;
  bookmarkIds?: string[];
}

export function createCollection(
  input: CreateCollectionInput,
  id: string = crypto.randomUUID()
): Collection {
  if (!input.name || input.name.trim().length === 0) {
    throw new Error("Collection name is required");
  }

  const now = new Date();
  return {
    id,
    name: input.name.trim(),
    slug: slugifyCollection(input.name),
    description: input.description?.trim(),
    bookmarkIds: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function updateCollection(
  collection: Collection,
  input: UpdateCollectionInput
): Collection {
  const updated: Collection = {
    ...collection,
    updatedAt: new Date(),
  };

  if (input.name !== undefined) {
    if (input.name.trim().length === 0) {
      throw new Error("Collection name cannot be empty");
    }
    updated.name = input.name.trim();
    updated.slug = slugifyCollection(input.name);
  }

  if (input.description !== undefined) {
    updated.description = input.description.trim() || undefined;
  }

  if (input.bookmarkIds !== undefined) {
    updated.bookmarkIds = [...new Set(input.bookmarkIds)];
  }

  return updated;
}

export function addBookmarkToCollection(
  collection: Collection,
  bookmarkId: string
): Collection {
  if (collection.bookmarkIds.includes(bookmarkId)) {
    return collection;
  }
  return {
    ...collection,
    bookmarkIds: [...collection.bookmarkIds, bookmarkId],
    updatedAt: new Date(),
  };
}

export function removeBookmarkFromCollection(
  collection: Collection,
  bookmarkId: string
): Collection {
  return {
    ...collection,
    bookmarkIds: collection.bookmarkIds.filter((id) => id !== bookmarkId),
    updatedAt: new Date(),
  };
}

function slugifyCollection(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export interface CreateTagInput {
  name: string;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-');
}

export function createTag(input: CreateTagInput): Tag {
  const { name } = input;

  if (!name || name.trim().length === 0) {
    throw new Error('Tag name is required');
  }

  const trimmedName = name.trim();

  if (trimmedName.length > 50) {
    throw new Error('Tag name must be 50 characters or fewer');
  }

  return {
    id: crypto.randomUUID(),
    name: trimmedName,
    slug: slugify(trimmedName),
    createdAt: new Date(),
  };
}

export function normalizeTags(tags: string[]): string[] {
  const seen = new Set<string>();
  return tags
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0)
    .filter((t) => {
      if (seen.has(t)) return false;
      seen.add(t);
      return true;
    });
}

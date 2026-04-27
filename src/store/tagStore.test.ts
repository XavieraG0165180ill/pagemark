import { createInMemoryTagStore } from './tagStore';

describe('createInMemoryTagStore', () => {
  it('should add a new tag and return it', () => {
    const store = createInMemoryTagStore();
    const tag = store.add('TypeScript');
    expect(tag.slug).toBe('typescript');
    expect(tag.label).toBe('TypeScript');
    expect(tag.bookmarkCount).toBe(0);
  });

  it('should return existing tag if slug already exists', () => {
    const store = createInMemoryTagStore();
    const first = store.add('TypeScript');
    const second = store.add('typescript');
    expect(first).toBe(second);
  });

  it('should retrieve a tag by slug', () => {
    const store = createInMemoryTagStore();
    store.add('Open Source');
    const tag = store.getBySlug('open-source');
    expect(tag).toBeDefined();
    expect(tag?.label).toBe('Open Source');
  });

  it('should return undefined for unknown slug', () => {
    const store = createInMemoryTagStore();
    expect(store.getBySlug('nonexistent')).toBeUndefined();
  });

  it('should return all tags', () => {
    const store = createInMemoryTagStore();
    store.add('JavaScript');
    store.add('TypeScript');
    store.add('Rust');
    expect(store.getAll()).toHaveLength(3);
  });

  it('should increment bookmark count', () => {
    const store = createInMemoryTagStore();
    store.add('nodejs');
    store.incrementCount('nodejs');
    store.incrementCount('nodejs');
    expect(store.getBySlug('nodejs')?.bookmarkCount).toBe(2);
  });

  it('should decrement bookmark count without going below zero', () => {
    const store = createInMemoryTagStore();
    store.add('css');
    store.incrementCount('css');
    store.decrementCount('css');
    store.decrementCount('css');
    expect(store.getBySlug('css')?.bookmarkCount).toBe(0);
  });

  it('should delete a tag by slug', () => {
    const store = createInMemoryTagStore();
    store.add('temp');
    expect(store.delete('temp')).toBe(true);
    expect(store.getBySlug('temp')).toBeUndefined();
  });

  it('should return false when deleting a non-existent tag', () => {
    const store = createInMemoryTagStore();
    expect(store.delete('ghost')).toBe(false);
  });

  it('should return popular tags sorted by bookmark count', () => {
    const store = createInMemoryTagStore();
    store.add('a');
    store.add('b');
    store.add('c');
    store.incrementCount('b');
    store.incrementCount('b');
    store.incrementCount('c');
    const popular = store.getPopular(2);
    expect(popular[0].slug).toBe('b');
    expect(popular[1].slug).toBe('c');
    expect(popular).toHaveLength(2);
  });
});

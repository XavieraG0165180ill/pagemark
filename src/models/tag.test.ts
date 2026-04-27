import { describe, it, expect } from 'vitest';
import { createTag, slugify, normalizeTags } from './tag';

describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world');
  });

  it('lowercases the string', () => {
    expect(slugify('TypeScript')).toBe('typescript');
  });

  it('removes special characters', () => {
    expect(slugify('c++ programming!')).toBe('c-programming');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('hello   world')).toBe('hello-world');
  });

  it('trims leading and trailing whitespace', () => {
    expect(slugify('  tag  ')).toBe('tag');
  });
});

describe('createTag', () => {
  it('creates a tag with valid input', () => {
    const tag = createTag({ name: 'TypeScript' });
    expect(tag.name).toBe('TypeScript');
    expect(tag.slug).toBe('typescript');
    expect(tag.id).toBeDefined();
    expect(tag.createdAt).toBeInstanceOf(Date);
  });

  it('trims whitespace from name', () => {
    const tag = createTag({ name: '  javascript  ' });
    expect(tag.name).toBe('javascript');
  });

  it('throws if name is empty', () => {
    expect(() => createTag({ name: '' })).toThrow('Tag name is required');
  });

  it('throws if name is only whitespace', () => {
    expect(() => createTag({ name: '   ' })).toThrow('Tag name is required');
  });

  it('throws if name exceeds 50 characters', () => {
    const longName = 'a'.repeat(51);
    expect(() => createTag({ name: longName })).toThrow(
      'Tag name must be 50 characters or fewer'
    );
  });

  it('accepts a name of exactly 50 characters', () => {
    const name = 'a'.repeat(50);
    const tag = createTag({ name });
    expect(tag.name).toBe(name);
  });
});

describe('normalizeTags', () => {
  it('lowercases and trims all tags', () => {
    expect(normalizeTags(['  JS ', 'TypeScript'])).toEqual(['js', 'typescript']);
  });

  it('removes duplicates', () => {
    expect(normalizeTags(['js', 'JS', 'js'])).toEqual(['js']);
  });

  it('filters out empty strings', () => {
    expect(normalizeTags(['js', '', '  '])).toEqual(['js']);
  });

  it('returns empty array for empty input', () => {
    expect(normalizeTags([])).toEqual([]);
  });
});

/**
 * Types for the suggestion service feature.
 * Provides tag and related-bookmark suggestions based on existing bookmark data.
 */

export interface TagSuggestion {
  /** Suggested tag slug */
  tag: string;
  /** Number of bookmarks on the same domain that use this tag */
  frequency: number;
}

export interface RelatedSuggestion {
  /** IDs of bookmarks that share at least one tag with the source bookmark */
  relatedBookmarks: string[];
  /** Tags used by related bookmarks that the source bookmark does not have */
  tags: string[];
}

export interface SuggestionQuery {
  /** Fully-qualified URL to generate tag suggestions for */
  url: string;
}

export interface RelatedQuery {
  /** ID of the bookmark to find related content for */
  bookmarkId: string;
  /** Maximum number of related bookmarks to return (default: 10) */
  limit?: number;
}

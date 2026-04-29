import { Bookmark } from "../models/bookmark";
import { Tag } from "../models/tag";

/** Supported import/export format identifiers */
export type ExportFormat = "json" | "html";

/** Payload shape for JSON-based export/import */
export interface ExportData {
  version: string;
  exportedAt: string;
  bookmarks: Bookmark[];
  tags: Tag[];
}

/** Result returned after a bulk import operation */
export interface ImportResult {
  /** Number of bookmarks successfully imported */
  imported: number;
  /** Number of bookmarks skipped (e.g. duplicates) */
  skipped: number;
  /** Any non-fatal error messages encountered during import */
  errors: string[];
}

/** Options to control import behaviour */
export interface ImportOptions {
  /** If true, existing bookmarks with the same URL will be overwritten */
  overwrite?: boolean;
  /** If true, tags from imported bookmarks are merged with existing tags */
  mergeTags?: boolean;
}

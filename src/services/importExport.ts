import { Bookmark, createBookmark } from "../models/bookmark";
import { Tag, normalizeTags } from "../models/tag";

export interface ExportData {
  version: string;
  exportedAt: string;
  bookmarks: Bookmark[];
  tags: Tag[];
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export function exportToJson(bookmarks: Bookmark[], tags: Tag[]): ExportData {
  return {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    bookmarks,
    tags,
  };
}

export function parseImportData(raw: unknown): ExportData {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Invalid import data: expected an object");
  }
  const data = raw as Record<string, unknown>;
  if (!data.version || !data.bookmarks || !Array.isArray(data.bookmarks)) {
    throw new Error("Invalid import data: missing required fields");
  }
  return data as unknown as ExportData;
}

export function importFromNetscapeHtml(html: string): Partial<Bookmark>[] {
  const results: Partial<Bookmark>[] = [];
  const linkRegex = /<A\s+HREF="([^"]+)"[^>]*>([^<]+)<\/A>/gi;
  let match: RegExpExecArray | null;
  while ((match = linkRegex.exec(html)) !== null) {
    const [, url, title] = match;
    const tagsAttr = match[0].match(/TAGS="([^"]*)"/i);
    const rawTags = tagsAttr ? tagsAttr[1].split(",").map((t) => t.trim()).filter(Boolean) : [];
    results.push({
      url: url.trim(),
      title: title.trim(),
      tags: normalizeTags(rawTags),
    });
  }
  return results;
}

export function buildNetscapeHtml(bookmarks: Bookmark[]): string {
  const items = bookmarks
    .map((b) => {
      const tags = b.tags.join(",");
      const date = Math.floor(new Date(b.createdAt).getTime() / 1000);
      return `    <DT><A HREF="${b.url}" ADD_DATE="${date}" TAGS="${tags}">${b.title}</A>`;
    })
    .join("\n");
  return `<!DOCTYPE NETSCAPE-Bookmark-file-1>\n<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n<TITLE>Bookmarks</TITLE>\n<H1>Bookmarks</H1>\n<DL><p>\n${items}\n</DL><p>`;
}

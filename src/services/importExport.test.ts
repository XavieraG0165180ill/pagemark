import { describe, it, expect } from "vitest";
import {
  exportToJson,
  parseImportData,
  importFromNetscapeHtml,
  buildNetscapeHtml,
} from "./importExport";
import { createBookmark } from "../models/bookmark";

const sampleBookmark = createBookmark({
  url: "https://example.com",
  title: "Example",
  tags: ["dev", "tools"],
});

describe("exportToJson", () => {
  it("includes version and exportedAt", () => {
    const result = exportToJson([sampleBookmark], []);
    expect(result.version).toBe("1.0");
    expect(result.exportedAt).toBeTruthy();
    expect(result.bookmarks).toHaveLength(1);
  });
});

describe("parseImportData", () => {
  it("parses valid export data", () => {
    const data = exportToJson([sampleBookmark], []);
    const parsed = parseImportData(data);
    expect(parsed.bookmarks).toHaveLength(1);
  });

  it("throws on invalid data", () => {
    expect(() => parseImportData(null)).toThrow();
    expect(() => parseImportData({ version: "1.0" })).toThrow();
  });
});

describe("importFromNetscapeHtml", () => {
  const html = `<DL><p>
    <DT><A HREF="https://example.com" TAGS="dev,tools">Example</A>
    <DT><A HREF="https://other.org" TAGS="">Other</A>
  </DL>`;

  it("extracts bookmarks from HTML", () => {
    const results = importFromNetscapeHtml(html);
    expect(results).toHaveLength(2);
    expect(results[0].url).toBe("https://example.com");
    expect(results[0].tags).toContain("dev");
  });

  it("handles empty tags", () => {
    const results = importFromNetscapeHtml(html);
    expect(results[1].tags).toHaveLength(0);
  });
});

describe("buildNetscapeHtml", () => {
  it("produces valid Netscape bookmark HTML", () => {
    const html = buildNetscapeHtml([sampleBookmark]);
    expect(html).toContain("NETSCAPE-Bookmark-file-1");
    expect(html).toContain("https://example.com");
    expect(html).toContain('TAGS="dev,tools"');
  });
});

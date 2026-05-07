import { describe, it, expect, vi } from "vitest";
import { createBrokenLinkService, FetchFn } from "./brokenLinkService";
import { createBookmark } from "../models/bookmark";

function makeBookmark(url: string) {
  return createBookmark({ url, title: "Test" });
}

function buildService(responses: Record<string, number | Error>) {
  const fetchFn: FetchFn = async (url) => {
    const val = responses[url];
    if (val instanceof Error) throw val;
    return { status: val };
  };
  return createBrokenLinkService(fetchFn);
}

describe("brokenLinkService", () => {
  it("returns statusCode for a reachable URL", async () => {
    const svc = buildService({ "https://example.com": 200 });
    const result = await svc.checkUrl("https://example.com");
    expect(result.statusCode).toBe(200);
    expect(result.error).toBeUndefined();
  });

  it("returns statusCode 404 for a not-found URL", async () => {
    const svc = buildService({ "https://example.com/gone": 404 });
    const result = await svc.checkUrl("https://example.com/gone");
    expect(result.statusCode).toBe(404);
  });

  it("returns null statusCode and error on network failure", async () => {
    const svc = buildService({ "https://dead.example": new Error("ECONNREFUSED") });
    const result = await svc.checkUrl("https://dead.example");
    expect(result.statusCode).toBeNull();
    expect(result.error).toBe("ECONNREFUSED");
  });

  it("checkBookmark returns result with bookmarkId and url", async () => {
    const bm = makeBookmark("https://example.com");
    const svc = buildService({ "https://example.com": 200 });
    const result = await svc.checkBookmark(bm);
    expect(result.bookmarkId).toBe(bm.id);
    expect(result.url).toBe("https://example.com");
    expect(result.statusCode).toBe(200);
    expect(result.checkedAt).toBeTruthy();
  });

  it("checkAll returns results for all bookmarks", async () => {
    const bm1 = makeBookmark("https://a.com");
    const bm2 = makeBookmark("https://b.com");
    const svc = buildService({ "https://a.com": 200, "https://b.com": 503 });
    const results = await svc.checkAll([bm1, bm2]);
    expect(results).toHaveLength(2);
    expect(results[0].statusCode).toBe(200);
    expect(results[1].statusCode).toBe(503);
  });

  it("getBroken filters out healthy links", async () => {
    const bm1 = makeBookmark("https://ok.com");
    const bm2 = makeBookmark("https://broken.com");
    const bm3 = makeBookmark("https://dead.net");
    const svc = buildService({
      "https://ok.com": 200,
      "https://broken.com": 404,
      "https://dead.net": new Error("timeout"),
    });
    const results = await svc.checkAll([bm1, bm2, bm3]);
    const broken = svc.getBroken(results);
    expect(broken).toHaveLength(2);
    expect(broken.map((r) => r.url)).toContain("https://broken.com");
    expect(broken.map((r) => r.url)).toContain("https://dead.net");
  });
});

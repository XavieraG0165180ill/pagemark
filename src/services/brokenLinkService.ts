import { Bookmark } from "../models/bookmark";

export interface BrokenLinkResult {
  bookmarkId: string;
  url: string;
  statusCode: number | null;
  checkedAt: string;
  error?: string;
}

export interface BrokenLinkService {
  checkUrl(url: string): Promise<{ statusCode: number | null; error?: string }>;
  checkBookmark(bookmark: Bookmark): Promise<BrokenLinkResult>;
  checkAll(bookmarks: Bookmark[]): Promise<BrokenLinkResult[]>;
  getBroken(results: BrokenLinkResult[]): BrokenLinkResult[];
}

export type FetchFn = (url: string) => Promise<{ status: number }>;

export function createBrokenLinkService(fetchFn?: FetchFn): BrokenLinkService {
  const defaultFetch: FetchFn = async (url) => {
    const res = await fetch(url, { method: "HEAD", redirect: "follow" });
    return { status: res.status };
  };

  const doFetch = fetchFn ?? defaultFetch;

  async function checkUrl(
    url: string
  ): Promise<{ statusCode: number | null; error?: string }> {
    try {
      const { status } = await doFetch(url);
      return { statusCode: status };
    } catch (err) {
      return {
        statusCode: null,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }

  async function checkBookmark(bookmark: Bookmark): Promise<BrokenLinkResult> {
    const { statusCode, error } = await checkUrl(bookmark.url);
    return {
      bookmarkId: bookmark.id,
      url: bookmark.url,
      statusCode,
      checkedAt: new Date().toISOString(),
      ...(error ? { error } : {}),
    };
  }

  async function checkAll(bookmarks: Bookmark[]): Promise<BrokenLinkResult[]> {
    return Promise.all(bookmarks.map((b) => checkBookmark(b)));
  }

  function getBroken(results: BrokenLinkResult[]): BrokenLinkResult[] {
    return results.filter(
      (r) => r.statusCode === null || r.statusCode >= 400
    );
  }

  return { checkUrl, checkBookmark, checkAll, getBroken };
}

import { describe, it, expect, beforeEach } from "vitest";
import {
  createInMemoryShareStore,
  createShareService,
  ShareStore,
} from "./shareService";

function buildService(overrides?: { generateId?: () => string }) {
  const shareStore: ShareStore = createInMemoryShareStore();
  const service = createShareService({
    shareStore,
    generateId: overrides?.generateId ?? (() => "fixed-id"),
  });
  return { service, shareStore };
}

describe("createShareService", () => {
  it("creates a share link with a token", async () => {
    const { service } = buildService();
    const link = await service.createShareLink("bm-1");
    expect(link.bookmarkId).toBe("bm-1");
    expect(link.token).toHaveLength(32);
    expect(link.expiresAt).toBeNull();
    expect(link.viewCount).toBe(0);
  });

  it("sets expiry when expiresInDays is provided", async () => {
    const { service } = buildService();
    const before = Date.now();
    const link = await service.createShareLink("bm-2", 7);
    expect(link.expiresAt).not.toBeNull();
    const diff = link.expiresAt!.getTime() - before;
    expect(diff).toBeGreaterThanOrEqual(7 * 86400_000 - 100);
  });

  it("resolves a valid token and increments viewCount", async () => {
    const { service } = buildService();
    const link = await service.createShareLink("bm-3");
    const resolved = await service.resolveToken(link.token);
    expect(resolved).not.toBeNull();
    expect(resolved!.viewCount).toBe(1);
  });

  it("returns null for unknown token", async () => {
    const { service } = buildService();
    const result = await service.resolveToken("nonexistent");
    expect(result).toBeNull();
  });

  it("returns null for expired token", async () => {
    const { service, shareStore } = buildService();
    const link = await service.createShareLink("bm-4", 1);
    const expired = { ...link, expiresAt: new Date(Date.now() - 1000) };
    await shareStore.update(expired);
    const result = await service.resolveToken(link.token);
    expect(result).toBeNull();
  });

  it("lists links for a bookmark", async () => {
    const { service } = buildService({ generateId: (() => { let n = 0; return () => `id-${n++}`; })() });
    await service.createShareLink("bm-5");
    await service.createShareLink("bm-5");
    const links = await service.getLinksForBookmark("bm-5");
    expect(links).toHaveLength(2);
  });

  it("deletes a share link", async () => {
    const { service } = buildService();
    const link = await service.createShareLink("bm-6");
    await service.deleteShareLink(link.id);
    const result = await service.resolveToken(link.token);
    expect(result).toBeNull();
  });
});

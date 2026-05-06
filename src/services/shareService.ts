import { randomBytes } from "crypto";

export interface ShareLink {
  id: string;
  bookmarkId: string;
  token: string;
  expiresAt: Date | null;
  createdAt: Date;
  viewCount: number;
}

export interface ShareStore {
  add(link: ShareLink): Promise<void>;
  getByToken(token: string): Promise<ShareLink | undefined>;
  getByBookmarkId(bookmarkId: string): Promise<ShareLink[]>;
  update(link: ShareLink): Promise<void>;
  delete(id: string): Promise<void>;
  getAll(): Promise<ShareLink[]>;
}

export function generateToken(): string {
  return randomBytes(16).toString("hex");
}

export function createInMemoryShareStore(): ShareStore {
  const links = new Map<string, ShareLink>();

  return {
    async add(link) { links.set(link.id, { ...link }); },
    async getByToken(token) {
      return [...links.values()].find((l) => l.token === token);
    },
    async getByBookmarkId(bookmarkId) {
      return [...links.values()].filter((l) => l.bookmarkId === bookmarkId);
    },
    async update(link) { links.set(link.id, { ...link }); },
    async delete(id) { links.delete(id); },
    async getAll() { return [...links.values()]; },
  };
}

export interface ShareServiceDeps {
  shareStore: ShareStore;
  generateId?: () => string;
}

export function createShareService({ shareStore, generateId = () => randomBytes(8).toString("hex") }: ShareServiceDeps) {
  return {
    async createShareLink(bookmarkId: string, expiresInDays?: number): Promise<ShareLink> {
      const link: ShareLink = {
        id: generateId(),
        bookmarkId,
        token: generateToken(),
        expiresAt: expiresInDays
          ? new Date(Date.now() + expiresInDays * 86400_000)
          : null,
        createdAt: new Date(),
        viewCount: 0,
      };
      await shareStore.add(link);
      return link;
    },

    async resolveToken(token: string): Promise<ShareLink | null> {
      const link = await shareStore.getByToken(token);
      if (!link) return null;
      if (link.expiresAt && link.expiresAt < new Date()) return null;
      const updated = { ...link, viewCount: link.viewCount + 1 };
      await shareStore.update(updated);
      return updated;
    },

    async getLinksForBookmark(bookmarkId: string): Promise<ShareLink[]> {
      return shareStore.getByBookmarkId(bookmarkId);
    },

    async deleteShareLink(id: string): Promise<void> {
      await shareStore.delete(id);
    },
  };
}

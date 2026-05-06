import { describe, it, expect, beforeEach } from "vitest";
import {
  createArchiveService,
  createInMemoryArchiveStore,
  ArchiveService,
} from "./archiveService";
import { createBookmark } from "../models/bookmark";

function buildService(): ArchiveService {
  const store = createInMemoryArchiveStore();
  return createArchiveService(store);
}

const sampleBookmark = createBookmark({
  url: "https://example.com",
  title: "Example",
  tags: [],
});

describe("archiveService", () => {
  let service: ArchiveService;

  beforeEach(() => {
    service = buildService();
  });

  it("creates a pending archive record on requestArchive", () => {
    const record = service.requestArchive(sampleBookmark);
    expect(record.bookmarkId).toBe(sampleBookmark.id);
    expect(record.url).toBe(sampleBookmark.url);
    expect(record.status).toBe("pending");
  });

  it("retrieves the archive status by bookmarkId", () => {
    service.requestArchive(sampleBookmark);
    const record = service.getStatus(sampleBookmark.id);
    expect(record).toBeDefined();
    expect(record?.status).toBe("pending");
  });

  it("returns undefined for unknown bookmarkId", () => {
    const record = service.getStatus("nonexistent");
    expect(record).toBeUndefined();
  });

  it("marks a record as archived with snapshotUrl", () => {
    service.requestArchive(sampleBookmark);
    const updated = service.markArchived(sampleBookmark.id, "https://archive.org/snap/1");
    expect(updated?.status).toBe("archived");
    expect(updated?.snapshotUrl).toBe("https://archive.org/snap/1");
    expect(updated?.archivedAt).toBeDefined();
  });

  it("markArchived returns undefined for unknown bookmarkId", () => {
    const result = service.markArchived("ghost", "https://archive.org/snap/x");
    expect(result).toBeUndefined();
  });

  it("marks a record as failed with an error message", () => {
    service.requestArchive(sampleBookmark);
    const updated = service.markFailed(sampleBookmark.id, "Timeout");
    expect(updated?.status).toBe("failed");
    expect(updated?.errorMessage).toBe("Timeout");
  });

  it("markFailed returns undefined for unknown bookmarkId", () => {
    const result = service.markFailed("ghost", "error");
    expect(result).toBeUndefined();
  });

  it("listAll returns all archive records", () => {
    const b2 = createBookmark({ url: "https://other.com", title: "Other", tags: [] });
    service.requestArchive(sampleBookmark);
    service.requestArchive(b2);
    expect(service.listAll()).toHaveLength(2);
  });

  it("removes an archive record", () => {
    service.requestArchive(sampleBookmark);
    service.remove(sampleBookmark.id);
    expect(service.getStatus(sampleBookmark.id)).toBeUndefined();
    expect(service.listAll()).toHaveLength(0);
  });
});

export type AuditAction =
  | "bookmark.created"
  | "bookmark.updated"
  | "bookmark.deleted"
  | "collection.created"
  | "collection.updated"
  | "collection.deleted"
  | "tag.created"
  | "tag.deleted"
  | "import.completed"
  | "export.completed";

export interface AuditEntry {
  id: string;
  action: AuditAction;
  resourceId?: string;
  resourceType?: string;
  meta?: Record<string, unknown>;
  timestamp: string;
}

export interface AuditStore {
  log(entry: Omit<AuditEntry, "id" | "timestamp">): AuditEntry;
  getAll(): AuditEntry[];
  getByAction(action: AuditAction): AuditEntry[];
  getByResourceId(resourceId: string): AuditEntry[];
  clear(): void;
}

export interface AuditService {
  log(action: AuditAction, options?: { resourceId?: string; resourceType?: string; meta?: Record<string, unknown> }): AuditEntry;
  getAll(): AuditEntry[];
  getByAction(action: AuditAction): AuditEntry[];
  getByResourceId(resourceId: string): AuditEntry[];
}

let _idCounter = 0;
function generateId(): string {
  return `audit_${Date.now()}_${++_idCounter}`;
}

export function createInMemoryAuditStore(): AuditStore {
  const entries: AuditEntry[] = [];

  return {
    log(entry) {
      const full: AuditEntry = {
        ...entry,
        id: generateId(),
        timestamp: new Date().toISOString(),
      };
      entries.push(full);
      return full;
    },
    getAll() {
      return [...entries];
    },
    getByAction(action) {
      return entries.filter((e) => e.action === action);
    },
    getByResourceId(resourceId) {
      return entries.filter((e) => e.resourceId === resourceId);
    },
    clear() {
      entries.length = 0;
    },
  };
}

export function createAuditService(store: AuditStore): AuditService {
  return {
    log(action, options = {}) {
      return store.log({ action, ...options });
    },
    getAll() {
      return store.getAll();
    },
    getByAction(action) {
      return store.getByAction(action);
    },
    getByResourceId(resourceId) {
      return store.getByResourceId(resourceId);
    },
  };
}

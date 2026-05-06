import { describe, it, expect, beforeEach } from "vitest";
import {
  createInMemoryNotificationStore,
  createNotificationService,
  NotificationStore,
} from "./notificationService";

function buildService() {
  const store: NotificationStore = createInMemoryNotificationStore();
  const service = createNotificationService(store);
  return { store, service };
}

describe("notificationService", () => {
  let service: ReturnType<typeof buildService>["service"];

  beforeEach(() => {
    ({ service } = buildService());
  });

  it("sets and retrieves preferences", () => {
    const prefs = service.setPreferences({
      userId: "user-1",
      channels: ["email", "browser"],
      reminderAlerts: true,
      weeklyDigest: false,
    });
    expect(service.getPreferences("user-1")).toEqual(prefs);
  });

  it("returns undefined for unknown user preferences", () => {
    expect(service.getPreferences("ghost")).toBeUndefined();
  });

  it("sends a notification and retrieves it", () => {
    const n = service.send("user-1", "reminder", "Check this!", "You saved this a year ago.");
    expect(n.userId).toBe("user-1");
    expect(n.type).toBe("reminder");
    expect(n.read).toBe(false);
    expect(n.channel).toBe("browser");
  });

  it("retrieves all notifications for a user", () => {
    service.send("user-1", "reminder", "A", "body");
    service.send("user-1", "digest", "B", "body");
    service.send("user-2", "reminder", "C", "body");
    const forUser1 = service.getForUser("user-1");
    expect(forUser1).toHaveLength(2);
  });

  it("marks a notification as read", () => {
    const n = service.send("user-1", "share_expiry", "Expiring", "Your share link expires soon.");
    expect(service.markRead(n.id)).toBe(true);
    const updated = service.getForUser("user-1").find((x) => x.id === n.id);
    expect(updated?.read).toBe(true);
  });

  it("returns false when marking unknown notification as read", () => {
    expect(service.markRead("nope")).toBe(false);
  });

  it("deletes a notification", () => {
    const n = service.send("user-1", "import_complete", "Done", "Import finished.");
    expect(service.deleteNotification(n.id)).toBe(true);
    expect(service.getForUser("user-1")).toHaveLength(0);
  });

  it("uses specified channel when sending", () => {
    const n = service.send("user-1", "digest", "Weekly", "Your digest.", "email");
    expect(n.channel).toBe("email");
  });
});

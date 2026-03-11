const DEVICE_ID_KEY = "selah_device_id";

/**
 * Returns a persistent device ID (UUID v4) stored in localStorage.
 * Generates one on first visit. This serves as the user's identity
 * for rate limiting, ownership, and deletion.
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";

  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

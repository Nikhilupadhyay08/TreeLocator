export type OfflineQueuedRequest = {
  id: string;
  url: string;
  method: string;
  headers: Array<[string, string]>;
  body: string | null;
  responseType: "json" | "text" | "blob" | "auto";
  createdAt: string;
};

const QUEUE_STORAGE_KEY = "treetrack_offline_queue";
const QUEUE_EVENT_NAME = "treetrack-offline-queue-changed";
const QUEUED_PATHS = [/^\/api\/trees(?:\/|$)/, /^\/api\/reports(?:\/|$)/, /^\/api\/iot(?:\/|$)/];
const QUEUED_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

let queueFlushInProgress = false;
let queueListenerRegistered = false;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readQueue(): OfflineQueuedRequest[] {
  if (!isBrowser()) return [];

  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as OfflineQueuedRequest[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: OfflineQueuedRequest[]): void {
  if (!isBrowser()) return;

  localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  window.dispatchEvent(new Event(QUEUE_EVENT_NAME));
}

function pathFromUrl(url: string): string {
  try {
    return new URL(url, window.location.origin).pathname;
  } catch {
    return url;
  }
}

export function shouldQueueOfflineRequest(url: string, method: string): boolean {
  if (!QUEUED_METHODS.has(method.toUpperCase())) return false;
  const path = pathFromUrl(url);
  return QUEUED_PATHS.some((pattern) => pattern.test(path));
}

export function enqueueOfflineRequest(request: Omit<OfflineQueuedRequest, "id" | "createdAt">): OfflineQueuedRequest | null {
  if (!isBrowser()) return null;

  const queuedRequest: OfflineQueuedRequest = {
    ...request,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const queue = readQueue();
  queue.push(queuedRequest);
  writeQueue(queue);
  return queuedRequest;
}

export function getOfflineQueueCount(): number {
  return readQueue().length;
}

export function subscribeOfflineQueue(listener: () => void): () => void {
  if (!isBrowser()) return () => undefined;

  const handler = () => listener();
  window.addEventListener(QUEUE_EVENT_NAME, handler);
  window.addEventListener("online", handler);
  window.addEventListener("offline", handler);

  return () => {
    window.removeEventListener(QUEUE_EVENT_NAME, handler);
    window.removeEventListener("online", handler);
    window.removeEventListener("offline", handler);
  };
}

export async function flushOfflineQueue(): Promise<void> {
  if (!isBrowser() || queueFlushInProgress || !navigator.onLine) return;

  queueFlushInProgress = true;

  try {
    const queue = readQueue();
    if (queue.length === 0) return;

    const remaining: OfflineQueuedRequest[] = [];

    for (const entry of queue) {
      try {
        const response = await fetch(entry.url, {
          method: entry.method,
          headers: new Headers(entry.headers),
          body: entry.body ?? undefined,
        });

        if (!response.ok) {
          remaining.push(entry, ...queue.slice(queue.indexOf(entry) + 1));
          break;
        }
      } catch {
        remaining.push(entry, ...queue.slice(queue.indexOf(entry) + 1));
        break;
      }
    }

    if (remaining.length === 0) {
      localStorage.removeItem(QUEUE_STORAGE_KEY);
      window.dispatchEvent(new Event(QUEUE_EVENT_NAME));
      return;
    }

    writeQueue(remaining);
  } finally {
    queueFlushInProgress = false;
  }
}

export function startOfflineQueueSync(): void {
  if (!isBrowser() || queueListenerRegistered) return;

  queueListenerRegistered = true;
  window.addEventListener("online", () => {
    void flushOfflineQueue();
  });

  void flushOfflineQueue();
}

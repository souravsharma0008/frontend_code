import type { EnvInfo, HealthStatus, Item, ItemWithId } from "./types";

/**
 * Base URL of the deployed FastAPI backend.
 *
 * Priority:
 *   1. A value the user typed into the UI (persisted in localStorage).
 *   2. The build-time VITE_BACKEND_URL env var.
 *   3. Empty string => same-origin (useful when a proxy is configured).
 */
const STORAGE_KEY = "backendBaseUrl";

export function getBackendUrl(): string {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) return stored.replace(/\/$/, "");
  const fromEnv = import.meta.env.VITE_BACKEND_URL as string | undefined;
  return (fromEnv ?? "").replace(/\/$/, "");
}

export function setBackendUrl(url: string): void {
  localStorage.setItem(STORAGE_KEY, url.trim());
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getBackendUrl();
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "include",
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch {
      /* response had no JSON body */
    }
    throw new Error(`${res.status}: ${detail}`);
  }

  // DELETE / empty responses still return JSON in this backend.
  return (await res.json()) as T;
}

export const api = {
  health: () => request<HealthStatus>("/health"),

  env: () => request<EnvInfo>("/env"),

  listItems: async (): Promise<ItemWithId[]> => {
    const data = await request<Record<string, Item>>("/items");
    return Object.entries(data).map(([id, item]) => ({
      id: Number(id),
      ...item,
    }));
  },

  createItem: (item: Item) =>
    request<{ id: number; item: Item }>("/items", {
      method: "POST",
      body: JSON.stringify(item),
    }),

  deleteItem: (id: number) =>
    request<{ status: string }>(`/items/${id}`, { method: "DELETE" }),
};

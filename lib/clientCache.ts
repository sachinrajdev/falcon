"use client";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export function makeHash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return String(h);
}

export function getCached<T>(bucket: string, key: string): T | null {
  try {
    const raw = localStorage.getItem("pragati_cache_" + bucket + "_" + key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as { ts: number; data: T };
    if (Date.now() - parsed.ts > CACHE_TTL_MS) {
      localStorage.removeItem("pragati_cache_" + bucket + "_" + key);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

export function setCached<T>(bucket: string, key: string, data: T) {
  try {
    localStorage.setItem(
      "pragati_cache_" + bucket + "_" + key,
      JSON.stringify({ ts: Date.now(), data }),
    );
  } catch {
    // Ignore storage errors.
  }
}

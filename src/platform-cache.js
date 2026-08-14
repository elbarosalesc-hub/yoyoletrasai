const CACHE_PREFIX = 'yoyo-cache:v1:';

function now() { return Date.now(); }

function readEntry(key) {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || typeof parsed.savedAt !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeEntry(key, value, ttlMs, staleMs) {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify({ value, savedAt: now(), ttlMs, staleMs }));
  } catch {
    // Cache failure must never block the application.
  }
}

export function clearPublicCache() {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(CACHE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch {
    // Best-effort only.
  }
}

export async function cachedPublicJson(url, {
  key = url,
  ttlMs = 5 * 60 * 1000,
  staleMs = 24 * 60 * 60 * 1000,
  force = false,
} = {}) {
  const cached = readEntry(key);
  const age = cached ? now() - cached.savedAt : Infinity;
  if (!force && cached && age <= cached.ttlMs) return { data: cached.value, source: 'cache-fresh' };

  try {
    const response = await fetch(url, {
      headers: cached?.value?.version ? { 'If-None-Match': `\"yoyo-resources-${cached.value.version}\"` } : undefined,
    });
    if (response.status === 304 && cached) {
      writeEntry(key, cached.value, ttlMs, staleMs);
      return { data: cached.value, source: 'cache-revalidated' };
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    writeEntry(key, data, ttlMs, staleMs);
    return { data, source: 'network' };
  } catch (error) {
    if (cached && age <= cached.staleMs) return { data: cached.value, source: 'cache-stale', error };
    throw error;
  }
}

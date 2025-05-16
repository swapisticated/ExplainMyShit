const CACHE_PREFIX = 'repo-cache-';
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function setCache<T>(key: string, data: T): void {
  const entry: CacheEntry<T> = {
    data,
    timestamp: Date.now(),
  };
  localStorage.setItem(key, JSON.stringify(entry));
}

export function getCache<T>(key: string): T | null {
  const entry = localStorage.getItem(key);
  if (!entry) return null;

  const { data, timestamp }: CacheEntry<T> = JSON.parse(entry);
  const isExpired = Date.now() - timestamp > CACHE_DURATION;

  if (isExpired) {
    localStorage.removeItem(key);
    return null;
  }

  return data;
}

export const generateCacheKey = (type: 'summary' | 'graph', params: Record<string, string>) => {
  const sortedParams = Object.entries(params)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}:${value}`)
    .join('|');
  return `${type}-${sortedParams}`;
};
const requestCache = new Map<string, unknown>();

export function getCacheKey(...parts: (string | number | undefined)[]): string {
  return parts.filter((p) => p !== undefined).join("::");
}

export function getCachedValue<T>(key: string): T | undefined {
  return requestCache.get(key) as T | undefined;
}

export function setCachedValue<T>(key: string, value: T): T {
  requestCache.set(key, value);
  return value;
}

export function clearCache(): void {
  requestCache.clear();
}

export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
): Promise<T> {
  const cached = getCachedValue<T>(key);
  if (cached) return cached;
  return setCachedValue(key, await fn());
}

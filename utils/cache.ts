/**
 * A simple in-memory cache utility to reduce API latency.
 * Stores values with a Time-To-Live (TTL).
 */
class MemoryCache {
    private cache: Map<string, { value: any; expiry: number }> = new Map();

    /**
     * Set a value in the cache.
     * @param key Unique key for the cached item
     * @param value The value to store
     * @param ttlSeconds Time-to-live in seconds
     */
    set(key: string, value: any, ttlSeconds: number) {
        const expiry = Date.now() + ttlSeconds * 1000;
        this.cache.set(key, { value, expiry });
    }

    /**
     * Get a value from the cache.
     * Returns null if not found or expired.
     */
    get<T>(key: string): T | null {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value as T;
    }

    /**
     * Clear the cache (for testing or manual invalidation)
     */
    clear() {
        this.cache.clear();
    }
}

// Global instance to share across API routes in the same Node.js process
// Note: In Next.js dev mode, this might reset on code changes, which is fine.
export const apiCache = new MemoryCache();

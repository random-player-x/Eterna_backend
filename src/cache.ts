
let cache = new Map<string, {value: any, expires: number}>();

export function setCache(key: string, value: any, ttl: number) {
    const expires = Date.now() + ttl;
    cache.set(key, { value, expires });
}

export function getCache(key: string): any | null {
    const entry = cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
        cache.delete(key);
        return null;
    }

    return entry.value;
}
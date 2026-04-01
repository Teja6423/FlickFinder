
import axios from "axios";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ---------- Client-side in-memory cache (5 min TTL) ----------
   Survives component unmount/remount and back-navigation.
   Keeps the last 200 unique URLs to avoid unbounded growth.
------------------------------------------------------------- */
const clientCache = new Map();
const CLIENT_CACHE_TTL = 1000 * 60 * 5; // 5 minutes
const CLIENT_CACHE_MAX = 200;

function getClientCache(url) {
    const entry = clientCache.get(url);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
        clientCache.delete(url);
        return null;
    }
    // LRU: refresh position on hit
    clientCache.delete(url);
    clientCache.set(url, entry);
    return entry.data;
}

function setClientCache(url, data) {
    if (clientCache.size >= CLIENT_CACHE_MAX) {
        clientCache.delete(clientCache.keys().next().value);
    }
    clientCache.set(url, { data, expiry: Date.now() + CLIENT_CACHE_TTL });
}

/* ---------- Exponential backoff retry ----------
   Delays: 500ms, 1000ms, 2000ms, 4000ms, 4000ms (capped)
----------------------------------------------- */
export const fetchDataWithRetry = async (url, retries = 5, signal = null) => {
    const cached = getClientCache(url);
    if (cached) return cached;

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await axios.get(url, signal ? { signal } : {});
            setClientCache(url, response.data);
            return response.data;
        } catch (error) {
            if (axios.isCancel(error)) return null;
            console.error(`Attempt ${attempt} failed for ${url}`, error);
            if (attempt < retries) {
                const backoff = Math.min(500 * 2 ** (attempt - 1), 4000);
                await delay(backoff);
            } else {
                console.error(`Failed to fetch after ${retries} attempts: ${url}`);
            }
        }
    }
    return null;
};

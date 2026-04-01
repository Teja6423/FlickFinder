import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import api from "./api.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

// CORS setup
const corsOptions = {
    origin: process.env.REACTPORT
};
app.use(cors(corsOptions));

/* -------------------- SIMPLE IN-MEMORY CACHE -------------------- */
const cache = new Map();
const CACHE_TTL_DEFAULT = 1000 * 60 * 60 * 6; // 6 hours for content
const CACHE_TTL_SEARCH  = 1000 * 60 * 30;      // 30 min for search results
const MAX_CACHE_SIZE = 500;

function getCached(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
        cache.delete(key);
        return null;
    }
    // LRU: move to end on access
    cache.delete(key);
    cache.set(key, entry);
    return entry.data;
}

function setCache(key, data, ttl = CACHE_TTL_DEFAULT) {
    if (cache.size >= MAX_CACHE_SIZE) {
        // Evict least-recently-used (first inserted after LRU moves)
        cache.delete(cache.keys().next().value);
    }
    cache.set(key, { data, expiry: Date.now() + ttl });
}

const tmdbDelay = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithCache(endpoint, ttl = CACHE_TTL_DEFAULT) {
    const cached = getCached(endpoint);
    if (cached) return cached;

    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const response = await api.get(endpoint);
            setCache(endpoint, response.data, ttl);
            return response.data;
        } catch (err) {
            lastError = err;
            // Don't retry on client errors (4xx), only on network/server failures
            if (err.response?.status && err.response.status < 500) throw err;
            if (attempt < 3) await tmdbDelay(600 * attempt); // 600ms, 1200ms
        }
    }
    throw lastError;
}
/* ---------------------------------------------------------------- */

/* -------------------- HOMEPAGE ROUTES -------------------- */
const categories = ["popular", "trending", "top-rated"];
const types = { movies: "movie", shows: "tv" };

categories.forEach((category) => {
    Object.entries(types).forEach(([key, value]) => {
        app.get(`/api/${category}/${key}`, async (req, res) => {
            try {
                let endpoint = `/${value}/${category}?region=IN`;
                if (category === "top-rated") endpoint = `/${value}/top_rated`;
                if (category === "trending") endpoint = `/trending/${value}/week`;

                const data = await fetchWithCache(endpoint);
                res.json(data);
            } catch (error) {
                console.error(`TMDB API Error fetching ${category}:`, error.response?.data || error.message);
                res.status(500).json({ error: error.response?.data || error.message });
            }
        });
    });
});
/* ---------------------------------------------------------- */

/* -------------------- CONTENT ROUTES -------------------- */
app.get("/api/:type(movie|tv)/:id/credits", async (req, res) => {
    const { type, id } = req.params;
    try {
        const data = await fetchWithCache(`/${type}/${id}/credits`);
        res.json(data);
    } catch (error) {
        console.error("TMDB API Error fetching credits:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

app.get("/api/:type(movie|tv)/:id/recommendations", async (req, res) => {
    const { type, id } = req.params;
    try {
        const data = await fetchWithCache(`/${type}/${id}/recommendations`);
        res.json(data);
    } catch (error) {
        console.error("TMDB API Error fetching recommendations:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

app.get("/api/:type(movie|tv)/:id/videos", async (req, res) => {
    const { type, id } = req.params;
    try {
        const data = await fetchWithCache(`/${type}/${id}/videos`);
        res.json(data);
    } catch (error) {
        console.error("TMDB API Error fetching videos:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

app.get("/api/:type(movie|tv)/:id/images", async (req, res) => {
    const { type, id } = req.params;
    try {
        const data = await fetchWithCache(`/${type}/${id}/images`);
        res.json(data);
    } catch (error) {
        console.error("TMDB API Error fetching images:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});
/* --------------------------------------------------------- */

/* -------------------- SEARCH ROUTE -------------------- */
app.get("/api/search/multi", async (req, res) => {
    const search_item = req.query.query;
    if (!search_item) return res.status(400).json({ error: "Search query is required" });

    try {
        const data = await fetchWithCache(`/search/multi?query=${encodeURIComponent(search_item)}`, CACHE_TTL_SEARCH);
        res.json(data);
    } catch (error) {
        console.error("TMDB API Error searching:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});
/* ------------------------------------------------------- */

/* -------------------- GENERIC ROUTES -------------------- */
app.get("/api/:contenttype/:contentid/:category", async (req, res) => {
    const { contenttype, contentid, category } = req.params;
    try {
        const data = await fetchWithCache(`/${contenttype}/${contentid}/${category}`);
        res.json(data);
    } catch (error) {
        console.error("TMDB API Error fetching content:", error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            error: error.response?.data || "Something went wrong!",
        });
    }
});

app.get("/api/:type/:id", async (req, res) => {
    const { type, id } = req.params;
    try {
        const data = await fetchWithCache(`/${type}/${id}`);
        res.json(data);
    } catch (error) {
        console.error("TMDB API Error fetching details:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});
/* -------------------------------------------------------- */

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

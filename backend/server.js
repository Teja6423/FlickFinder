import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import api from "./api.js";

dotenv.config();

const app = express();
const port = process.env.PORT;
const corsOptions = {
    origin: `http://localhost:${process.env.REACTPORT}`
};
app.use(cors(corsOptions));

// Generalized Route for Popular, Trending, and Top-Rated
const categories = ["popular", "trending", "top-rated"];
const types = { movies: "movie", shows: "tv" };

categories.forEach((category) => {
    Object.entries(types).forEach(([key, value]) => {
        app.get(`/api/${category}/${key}`, async (req, res) => {
            try {
                let endpoint = `/${value}/${category}`;
                
                // Fix for Top Rated (TMDb uses "top_rated" instead of "top-rated")
                if (category === "top-rated") endpoint = `/${value}/top_rated`;
                if (category === "trending") endpoint = `/trending/${value}/week`;

                const response = await api.get(endpoint);
                res.json(response.data);
            } catch (error) {
                console.error("TMDB API Error:", error.response?.data || error.message);
                res.status(500).json({ error: error.response?.data || error.message });
            }
        });
    });
});
// Search Route
app.get("/api/search/multi", async (req, res) => {
    const search_item = req.query.query;
    if (!search_item) return res.status(400).json({ error: "Search query is required" });

    try {
        const response = await api.get(`/search/multi?query=${encodeURIComponent(search_item)}`);
        res.json(response.data);
    } catch (error) {
        console.error("TMDB API Error:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

// Movie/TV Show Details Route
app.get("/api/:type/:id", async (req, res) => {
    const { type, id } = req.params;

    try {
        const response = await api.get(`/${type}/${id}`);
        res.json(response.data);
    } catch (error) {
        console.error("TMDB API Error:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

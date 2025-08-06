import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import api from "./api.js";

dotenv.config();

const app = express();
const port = process.env.PORT;
const corsOptions = {
    origin: process.env.REACTPORT
};
app.use(cors(corsOptions));

const categories = ["popular", "trending", "top-rated"];
const types = { movies: "movie", shows: "tv" };

categories.forEach((category) => {
    Object.entries(types).forEach(([key, value]) => {
        app.get(`/api/${category}/${key}`, async (req, res) => {
            try {
                let endpoint = `/${value}/${category}?region=IN`;

                if (category === "top-rated") endpoint = `/${value}/top_rated`;
                if (category === "trending") endpoint = `/trending/${value}/week`;

                const response = await api.get(endpoint);
                res.json(response.data);
            } catch (error) {
                console.error(`TMDB API Error fetching ${category}:`, error.response?.data || error.message);
                res.status(500).json({ error: error.response?.data || error.message });
            }
        });
    });
});

app.get("/api/:contenttype/:contentid/:category", async (req, res) => {
    const { contenttype, contentid, category } = req.params;

    try {
        const response = await api.get(`/${contenttype}/${contentid}/${category}`);
        res.json(response.data);
    } catch (error) {
        console.error("TMDB API Error fetching content:", error.response?.data || error.message);
        console.error("Params:", { contenttype, contentid, category });

        res.status(error.response?.status || 500).json({
            error: error.response?.data || "Something went wrong!",
        });
    }
});

app.get("api/:contentType/india",async(req,res)=>{
    const {contenttype} = req.params;
    try{
        const response = await api.get(`discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_origin_country=IN`)
        req.json(response.data)
    } catch(error){
        console.error("TMDB API Error fetching content:", error.response?.data || error.message);
        console.error("Params:", { contenttype });

    }
})

app.get("/api/movie/:movieid/credits", async (req, res) => {
    const { movieid } = req.params;
    try {
        const response = await api.get(`/movie/${movieid}/credits`);
        res.json(response.data);
    } catch (error) {
        console.error("TMDB API Error:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});
app.get("/api/tv/:seriesid/credits", async (req, res) => {
    const { seriesid } = req.params;
    try {
        const response = await api.get(`/tv/${seriesid}/credits`);
        res.json(response.data);
    } catch (error) {
        console.error("TMDB API Error:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

app.get("/api/movie/:movieid/videos", async(req,res)=>{
    const {movieid} = req.params;
    try{
        const response = await api.get(`/movie/${movieid}/videos`);
        res.json(response.data);
    }catch(error){
        console.log(`movieid: ${movieid}`)
        console.log("Error fetching content trailers", error.response?.data || error.message);
        res.status(500).json({error: error.response?.data || error.message});
    }
});
app.get("/api/tv/:tvid/videos", async(req,res)=>{
    const {tvid} = req.params;
    try{
        const response = await api.get(`/tv/${tvid}/videos`);
        res.json(response.data);
    }catch(error){
        console.log("Error fetching content trailers", error.response?.data || error.message);
        res.status(500).json({error: error.response?.data || error.message});
    }
});

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

app.get("/api/movie/:id/images", async (req,res)=>{
    const {id} = req.params;

    try{
        const response = await api.get(`/movie/${id}/images`);
        res.json(response.data);
    }catch(error){
        console.error("TMDB API Error:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});
app.get("/api/tv/:id/images", async (req,res)=>{
    const {id} = req.params;

    try{
        const response = await api.get(`/tv/${id}/images`);
        res.json(response.data);
    }catch(error){
        console.error("TMDB API Error:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

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

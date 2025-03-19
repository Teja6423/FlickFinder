import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import api from "./api.js";  

dotenv.config();

const app = express();
const port = process.env.PORT;
const corsOptions ={
    origin:`http://localhost:${process.env.REACTPORT}`
};
app.use(cors(corsOptions));


app.get("/api/popular/movies", async (req, res) => {
  try {
    const response = await api.get("/movie/popular");
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/popular/shows", async (req, res) => {
  try {
    const response = await api.get("/tv/popular");
    res.json(response.data);
  } catch (error) {
    console.error("TMDB API Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});
app.get("/api/trending/movies", async (req, res) => {
  try {
    const response = await api.get("trending/movie/week");
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/trending/shows", async (req, res) => {
  try {
    const response = await api.get("/trending/tv/week");
    res.json(response.data);
  } catch (error) {
    console.error("TMDB API Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});
app.get("/api/search/multi", async (req, res) => {
  const search_item = req.query.query;

  if (!search_item) {
      return res.status(400).json({ error: "Search query is required" });
  }

  try {
      const response = await api.get(`search/multi?query=${encodeURIComponent(search_item)}`);
      res.json(response.data);
  } catch (error) {
      console.error("TMDB API Error:", error.response?.data || error.message);
      res.status(500).json({ error: error.response?.data || error.message });
  }
});



app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

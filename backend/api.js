import axios from "axios";
import dotenv from "dotenv";
dotenv.config();


const api = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${process.env.TMDB_BEARER_KEY}`,
  },
});

export default api;
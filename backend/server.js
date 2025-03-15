import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import api from "./api.js";  
import axios from "axios";

dotenv.config();

const app = express();
const port = process.env.PORT;
const corsOptions ={
    origin:`http://localhost:${process.env.REACTPORT}`
};
app.use(cors(corsOptions));


app.get("/api/popular", async (req, res) => {
  try {
    const response = await api.get("/movie/popular");
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

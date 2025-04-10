const express = require("express");
const { getArtworks, getArtworkById } = require("./controllers/artworks-controllers");
const app = express();

const cors = require("cors");
app.use(cors());

app.get("/api/test", (request, response) => {
  response.json({ message: "Hello from the backend API!" });
});

app.get("/api/artworks", getArtworks)

app.get("/api/artworks/:artwork_id", getArtworkById)

module.exports = app;

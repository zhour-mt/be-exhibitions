const express = require("express");

const db = require("./db/connection");
const {
  getArtworks,
  getArtworkById,
  likeArtworkById,
  getGuestArtworks,
  postGuestArtwork,
  deleteGuestArtwork,
} = require("./controllers/artworks-controllers");
const app = express();


const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const { verifyToken } = require("./middleware/auth");

const cors = require("cors");
const { registerUser, handleLogin, getExhibitions, postExhibition, postArtwork, getExhibitionById, deleteExhibitionById, getSavedArtworks, postSavedArtwork, deleteSavedArtwork } = require("./controllers/user-controllers");
app.use(cors());
app.use(express.json());
require("dotenv").config({
  path: `${__dirname}/../.env.${process.env.NODE_ENV || "development"}`,
});

app.get("/api/test", (request, response) => {
  response.json({ message: "Hello from the backend API!" });
});

app.get("/api/artworks", getArtworks);

app.get("/api/artworks/:artwork_id", getArtworkById);

app.post("/api/register", registerUser);

app.post("/api/login", handleLogin);

app.get("/api/dashboard", verifyToken, (req, res) => {
  res.send({ message: `Welcome back, ${req.user.username}` });
});

app.get("/api/user/exhibitions", verifyToken, getExhibitions)

app.post("/api/user/exhibitions", verifyToken, postExhibition)

app.get("/api/user/exhibitions/artworks",verifyToken, getSavedArtworks)

app.post("/api/user/exhibitions/artworks", verifyToken, postSavedArtwork)

app.delete("/api/user/exhibitions/artworks/:artwork_id", verifyToken, deleteSavedArtwork);

app.get("/api/exhibitions/guest-artworks", getGuestArtworks);

app.post("/api/exhibitions/guest-artworks", postGuestArtwork);

app.delete("/api/exhibitions/guest-artworks/:artwork_id", deleteGuestArtwork);

app.post("/api/user/exhibitions/:exhibition_id/artwork", verifyToken, postArtwork)

app.delete("/api/user/exhibitions/:exhibition_id", verifyToken, deleteExhibitionById)

app.get("/api/user/exhibitions/:exhibition_id/artworks", verifyToken, getExhibitionById)



app.use((err, request, response, next) => {
  if (err.code === "23502" || err.code === "22P02" || err.status === 400) {
    response.status(400).send({ message: "Bad request." });
  }
  next(err);
});

app.use((err, request, response, next) => {
  if (err.status === 404) {
    response.status(404).send({ message: err.message });
  }
  next(err);
});

app.use((err, request, response, next) => {
  if (err.status === 401) {
    response.status(401).send({ message: err.message });
  }
  next(err);
});

app.use((err, request, response, next) => {
  response.status(500).send({ message: "Internal Server Error." });
});

module.exports = app;

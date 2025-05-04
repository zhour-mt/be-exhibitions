const express = require("express");

const db = require("./db/connection");
const {
  getArtworks,
  getArtworkById,
  likeArtworkById,
} = require("./controllers/artworks-controllers");
const app = express();


const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const { verifyToken } = require("./middleware/auth");

const cors = require("cors");
const { registerUser, handleLogin, getExhibitions, postExhibition, postArtwork } = require("./controllers/user-controllers");
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

app.post("/api/user/exhibitions/:exhibition_id/artwork", verifyToken, postArtwork)

// app.all("/*", (request, response, next) => {
//   response.status(404).send({ message: "Path not found." });
//   next(err);
// });

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

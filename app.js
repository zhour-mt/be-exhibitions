const express = require("express");
const db = require("./db/connection");
const {
  getArtworks,
  getArtworkById,
} = require("./controllers/artworks-controllers");
const app = express();
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

const cors = require("cors");
const { registerUser, handleLogin } = require("./controllers/user-controllers");
app.use(cors());
app.use(bodyParser.json());

app.get("/api/test", (request, response) => {
  response.json({ message: "Hello from the backend API!" });
});

app.get("/api/artworks", getArtworks);

app.get("/api/artworks/:artwork_id", getArtworkById);

app.post("/api/register", registerUser);

app.post("/api/login", handleLogin)



module.exports = app;

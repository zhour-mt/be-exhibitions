const express = require("express");
const app = express();

app.get("/api/test", (request, response) => {
  response.json({ message: "Hello from the backend API!" });
});

module.exports = app;

const { request, response } = require("express");
const {
  makeUser,
  loginUser,
  selectExhibitions,
  addExhibition,
  saveArtwork,
  selectExhibitionById,
} = require("../models/user-models");
const jwt = require("jsonwebtoken");

require("dotenv").config({
  path: `${__dirname}/../.env.${process.env.NODE_ENV || "development"}`,
});

exports.registerUser = (request, response, next) => {
  const { username, email, password } = request.body;

  makeUser({ username, email, password })
    .then((newUser) => {
      response.status(201).send({ user: newUser });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

exports.handleLogin = (request, response, next) => {
  const { username, password } = request.body;

  loginUser({ username, password })
    .then((user) => {
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not set in environment variables!");
      }

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      response.status(200).send({ user, token });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getExhibitions = (request, response, next) => {
  const { id } = request.user;
  selectExhibitions(id)
    .then((result) => {
      response.status(200).send({ exhibitions: result });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postExhibition = (request, response, next) => {
  const { id } = request.user;
  const { title, description } = request.body;
  addExhibition(id, title, description)
    .then((result) => {
      response.status(201).send({ exhibition: result });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postArtwork = (request, response, next) => {
  const { exhibition_id } = request.params;
  const { artwork_id, title, artist, image_id } = request.body;

  if (!artwork_id || !title || !image_id) {
    return Promise.reject({
      status: 400,
      message: "Artwork ID, title, and image_id are required",
    });
  }

  saveArtwork(exhibition_id, artwork_id, title, artist, image_id)
    .then((result) => {
      response.status(201).send({ updatedExhibition: result });
    })
    .catch((err) => {
      if (err.code === "23505") {
        res
          .status(409)
          .json({ message: "Artwork already saved to this exhibition" });
      } else {
        next(err);
      }
    });
};

exports.getExhibitionById = (request, response, next) => {
  const { exhibition_id } = request.params;
  selectExhibitionById(exhibition_id).then((result) => {
    response.status(200).send({ exhibition: result });
  })
};

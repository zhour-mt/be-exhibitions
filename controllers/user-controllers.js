const {
  makeUser,
  loginUser,
  selectExhibitions,
  addExhibition,
  saveArtwork,
  selectExhibitionById,
  removeExhibitionById,
  selectSavedArtworks,
  postSavedArtwork,
  removeSavedArtwork,
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
        { expiresIn: "3h" }
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
  const user_id = request.user.id;

  if (!artwork_id || !title || !image_id) {
    return Promise.reject({
      status: 400,
      message: "Artwork ID, title, and image_id are required",
    });
  }

  saveArtwork(exhibition_id, artwork_id, title, artist, image_id, user_id)
    .then((result) => {
      response.status(201).send({ updatedExhibition: result });
    })
    .catch((err) => {
      if (err.code === "23505") {
        response
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
  });
};

exports.deleteExhibitionById = (request, response, next) => {
  const { exhibition_id } = request.params;
  removeExhibitionById(exhibition_id)
    .then(() => {
      response.status(204).send({ message: "No content" });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getSavedArtworks = (request, response, next) => {
  const user_id = request.user.id;
  selectSavedArtworks(user_id)
    .then((result) => {
      response.status(200).send({ savedArtworks: result });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postSavedArtwork = (request, response, next) => {
  const { exhibition_id, artwork_id, title, artist, image_id } = request.body;

  const user_id = request.user.id;

  saveArtwork(exhibition_id, artwork_id, title, artist, image_id, user_id)
    .then((result) => {
      response.status(201).send({ updatedExhibition: result });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteSavedArtwork = (request, response, next) => {
  const { artwork_id } = request.params;
  removeSavedArtwork(artwork_id)
    .then((result) => {
      response.status(204).send({ message: "No content" });
    })
    .catch((err) => {
      next(err);
    });
};

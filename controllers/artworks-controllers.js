const {
  selectArtworks,
  selectArtworkById,
  insertGuestArtworks,
  selectGuestArtworks,
  removeGuestArtwork,
} = require("../models/artworks-models");

exports.getArtworks = (request, response, next) => {
  selectArtworks().then((results) => {
    response.status(200).send({ artworks: results });
  });
};

exports.getArtworkById = (request, response, next) => {
  const { artwork_id } = request.params;

  selectArtworkById(artwork_id)
    .then((result) => {
      response.status(200).send({ artwork: result });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getGuestArtworks = (request, response, next) => {
  const { guest_session_id } = request.query;
  if (!guest_session_id) {
    return Promise.reject({
      status: 400,
      message: "Missing guest session ID",
    });
  }

  selectGuestArtworks(guest_session_id)
    .then((result) => {
      response.status(200).send({ savedArtworks: result });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postGuestArtwork = (request, response, next) => {
  const { artwork_id, title, artist, image_id} =
    request.body;

    const {guest_session_id } = request.query
    
  if (!guest_session_id) {
    return Promise.reject({
      status: 400,
      message: "Missing guest session ID",
    });
  }
  insertGuestArtworks(artwork_id, title, artist, image_id, guest_session_id)
    .then((result) => {
      response.status(201).send({ savedArtwork: result });
    })
    .catch((err) => {
      if (err.code === "23505") {
        return Promise.reject({
          status: 409,
          message: "Artwork already saved",
        });
      }
      next(err);
    });
};

exports.deleteGuestArtwork = (request, response, next) => {
  const { artwork_id } = request.params;
  const { guest_session_id } = request.query;

  if (!guest_session_id) {
    return Promise.reject({
      status: 400,
      message: "Missing guest session ID",
    });
  }

  removeGuestArtwork(artwork_id, guest_session_id)
    .then(() => {
      response.status(204).send({ message: "No content" });
    })
    .catch((err) => {
      next(err);
    });
};

const { request } = require("express");
const db = require("../db/connection");
const format = require("pg-format");

exports.selectArtworks = () => {
  let artworkString = `SELECT * FROM artworks`;
  return db.query(artworkString).then((result) => {
    return result.rows;
  });
};

exports.selectArtworkById = (id) => {
  let artworkString = `SELECT * FROM artworks WHERE id=${id}`;

  return db.query(artworkString).then((result) => {
    return result.rows;
  });
};

exports.insertGuestArtworks = (
  artwork_id,
  title,
  artist,
  image_id,
  guest_session_id
) => {
  let guestArtworkQuery = `INSERT INTO exhibition_artworks (artwork_id, title, artist, image_id, guest_session_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`;

  return db
    .query(guestArtworkQuery, [
      artwork_id,
      title,
      artist,
      image_id,
      guest_session_id,
    ])
    .then((result) => {
      return result.rows[0];
    });
};

exports.selectGuestArtworks = (guest_session_id) => {
  let guestArtworksQuery = `
    SELECT * FROM exhibition_artworks
    WHERE guest_session_id = $1;
  `;

  return db.query(guestArtworksQuery, [guest_session_id]).then((result) => {
    return result.rows;
  });
};

exports.removeGuestArtwork = (artwork_id, guest_session_id) => {
  const deleteQuery = `
    DELETE FROM exhibition_artworks
    WHERE artwork_id = $1 AND guest_session_id = $2
    RETURNING *;
  `;

  return db.query(deleteQuery, [artwork_id, guest_session_id])
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({
          status: 404,
          message: "Artwork not found for guest",
        });
      }
      return result
    })
    
};

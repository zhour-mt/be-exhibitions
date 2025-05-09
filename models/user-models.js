const { request } = require("express");
const db = require("../db/connection");
const bcrypt = require("bcrypt");
const format = require("pg-format");

exports.makeUser = ({ username, email, password }) => {
  const existingUserQuery = `SELECT * FROM users WHERE email=$1 OR username=$2`;
  return db
    .query(existingUserQuery, [email, username])
    .then((response) => {
      if (response.rows.length > 0) {
        return Promise.reject({
          status: 409,
          message: "User already exists.",
        });
      }

      return bcrypt.hash(password, 10);
    })
    .then((response) => {
      const hashedPassword = response;
      const insertUserQuery =
        "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email";

      return db.query(insertUserQuery, [username, email, hashedPassword]);
    })
    .then((result) => {
      return result.rows[0];
    });
};

exports.loginUser = ({ username, password }) => {
  return db
    .query(`SELECT * FROM users WHERE username=$1`, [username])
    .then((result) => {
      const user = result.rows[0];
      if (!user) {
        return Promise.reject({ status: 401, message: "Username not found" });
      }
      return bcrypt.compare(password, user.password_hash).then((response) => {
        if (!response) {
          return Promise.reject({ status: 401, message: "Invalid password" });
        }
        const { password_hash, ...safeUser } = user;

        return safeUser;
      });
    });
};

exports.selectExhibitions = (user_id) => {
  let exhibitionString = `SELECT * FROM exhibitions WHERE user_id=$1`;
  return db.query(exhibitionString, [user_id]).then((result) => {
    return result.rows;
  });
};

exports.addExhibition = (user_id, title, description) => {
  return db
    .query(
      `INSERT INTO exhibitions (user_id, title, description)
        VALUES ($1, $2, $3)
        RETURNING *;
      `,
      [user_id, title, description]
    )
    .then((result) => result.rows[0]);
};

exports.saveArtwork = (
  exhibition_id,
  artwork_id,
  title,
  artist,
  image_id,
  user_id
) => {
  return db
    .query(
      `INSERT INTO exhibition_artworks
      (exhibition_id, artwork_id, title, artist, image_id, user_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
    `,
      [exhibition_id, artwork_id, title, artist, image_id, user_id]
    )
    .then((result) => {
      return result.rows[0];
    });
};

exports.selectExhibitionById = (id) => {
  let exhibitionString = `SELECT * FROM exhibition_artworks WHERE exhibition_id=$1`;

  return db.query(exhibitionString, [id]).then((result) => {
    return result.rows;
  });
};

exports.removeExhibitionById = (id) => {
  let exhibitionString = `DELETE FROM exhibitions WHERE id = $1`;

  return db.query(exhibitionString, [id]).then((result) => {
    return result;
  });
};

exports.selectSavedArtworks = (user_id) => {
  let artworksString = `SELECT * FROM exhibition_artworks WHERE user_id = $1 AND guest_session_id IS NULL`;

  return db.query(artworksString, [user_id]).then((result) => {
    return result.rows;
  });
};

exports.removeSavedArtwork = (artwork_id) => {
  let deleteArtworkQuery = `DELETE FROM exhibition_artworks
     WHERE artwork_id = $1
     RETURNING *;`;

  return db.query(deleteArtworkQuery, [artwork_id]).then((result) => {
    if (result.rowCount === 0) {
      return Promise.reject({
        status: 404,
        message: "Artwork not found in saved list",
      });
    }
    return result;
  });
};

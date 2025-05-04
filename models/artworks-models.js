const { request } = require("express");
const db = require("../db/connection");
const format = require("pg-format");

exports.selectArtworks = () => {
  let artworkString = `SELECT * FROM artworks`;
  return db.query(artworkString).then((result) => {
    return result.rows
  });
};

exports.selectArtworkById = (id) => {
    let artworkString = `SELECT * FROM artworks WHERE id=${id}`;

    return db.query(artworkString).then((result) => {
        return result.rows
    })
}



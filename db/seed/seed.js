const format = require("pg-format");
const db = require("../connection");

const seed = (artworkData) => {
  return db
    .query(`DROP TABLE IF EXISTS comments;`)
    .then(() => {
      return db.query(`DROP TABLE IF EXISTS artworks;`);
    })
    .then(() => {
      const artworksTablePromise = db.query(`
            CREATE TABLE artworks (
            id INTEGER,
            title VARCHAR(255),
            description TEXT,
            dimensions TEXT,
            image_url TEXT,
            colorfulness DECIMAL(5,2),
            exhibition_history TEXT
            );`);
      return Promise.all([artworksTablePromise]);
    })
    .then(() => {
      const insertArtworksQueryStr = format(
        `INSERT INTO artworks 
          (id, title, description, dimensions, image_url, colorfulness, exhibition_history)
          VALUES %L RETURNING *;`,
        artworkData[0].data.map((art) => [
          art.id,
          art.title,
          art.description,
          art.dimensions,
          `https://www.artic.edu/iiif/2/${art.image_id}/full/843,/0/default.jpg`,
          art.colorfulness,
          art.exhibition_history,
        ])
      );

      return db.query(insertArtworksQueryStr);
    });
};

module.exports = seed;

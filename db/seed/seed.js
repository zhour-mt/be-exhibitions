const format = require("pg-format");
const db = require("../connection");

const bcrypt = require("bcrypt")

const seed = (artworkData, userData) => {
  return db
    .query(`DROP TABLE IF EXISTS users, artworks CASCADE;`)

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


      const usersTablePromise = db.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(100) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`);

      return Promise.all([artworksTablePromise, usersTablePromise]);

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
    })
    .then(() => {
      const hashedUserPromises = userData.map((user) => {
        return bcrypt.hash(user.password, 10).then((hashedPassword) => {
          return [user.username, user.email, hashedPassword];
        });
      });

      return Promise.all(hashedUserPromises).then((hashedUsers) => {
        const insertUsersQuery = format(
          `INSERT INTO users (username, email, password_hash)
             VALUES %L RETURNING *;`,
          hashedUsers
        );
        return db.query(insertUsersQuery);
      });


    });
};

module.exports = seed;

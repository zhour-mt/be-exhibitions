const format = require("pg-format");
const db = require("../connection");

const bcrypt = require("bcrypt");

const seed = (
  artworkData,
  userData,
  exhibitionData,
  exhibitionArtworksData
) => {
  return db
    .query(
      `DROP TABLE IF EXISTS exhibition_artworks, exhibitions, users, artworks CASCADE;`
    )

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
      const exhibitionsTablePromise = db.query(`
        CREATE TABLE exhibitions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
        );`);
      return exhibitionsTablePromise;
    })
    .then(() => {
      const exhibitionArtworksTablePromise = db.query(`
        CREATE TABLE exhibition_artworks (
        id SERIAL PRIMARY KEY,
        exhibition_id INTEGER REFERENCES exhibitions(id) ON DELETE CASCADE,
        artwork_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        artist VARCHAR(255),
        image_id VARCHAR(255),
        guest_session_id UUID DEFAULT NULL, 
        UNIQUE(artwork_id, exhibition_id, guest_session_id)
        );`);

      return exhibitionArtworksTablePromise;
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
    })
    .then(() => {
      
      const insertExhibitionsQuery = format(
        `INSERT INTO exhibitions 
          (user_id, title, description)
          VALUES %L RETURNING *;`,
        exhibitionData.map((exhibition) => [
          exhibition.user_id,
          exhibition.title,
          exhibition.description,
        ])
      );
      return db.query(insertExhibitionsQuery);
    })
    .then(() => {
      const insertExhibitionsQuery = format(
        `INSERT INTO exhibition_artworks (exhibition_id, artwork_id, title, artist, image_id)
          VALUES %L RETURNING *;`,
        exhibitionArtworksData.map((artwork) => [
          artwork.exhibition_id,
          artwork.artwork_id,
          artwork.title,
          artwork.artist_title,
          artwork.image_id,
        ])
      );
      return db.query(insertExhibitionsQuery);
    })
    .catch((err) => {
      console.log("SEED ERROR:", err);
    });
};

module.exports = seed;

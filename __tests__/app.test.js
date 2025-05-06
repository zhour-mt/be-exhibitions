const app = require("../app");
const request = require("supertest");

const seed = require("../db/seed/seed");

const jwt = require("jsonwebtoken");

const userToken = jwt.sign(
  { id: 1, username: "testuser" },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

if (!userToken) {
  throw new Error("Provide a TEST_USER_TOKEN env variable for testing");
}

const {
  artworkData,
  userData,
  exhibitionData,
  exhibitionArtworksData,
} = require("../db/test-db/test-data/index");
const db = require("../db/connection");

beforeEach(() => {
  return seed(artworkData, userData, exhibitionData, exhibitionArtworksData);
});

afterAll(() => {
  db.end();
});

describe("Test API", () => {
  test("receive response from test api", () => {
    return request(app)
      .get("/api/test")
      .expect(200)
      .then(({ body }) => {
        expect(body.message).toBe("Hello from the backend API!");
      });
  });
});

describe("GET /api/artworks", () => {
  test("200: responds with an object including all available artworks", () => {
    return request(app)
      .get("/api/artworks")
      .expect(200)
      .then(({ body }) => {
        expect(body.artworks.length).toBe(3);
      });
  });
});

describe("GET /api/artworks/:artwork_id", () => {
  test("200: responds with an object including the artwork with the given id", () => {
    return request(app)
      .get("/api/artworks/161")
      .expect(200)
      .then(({ body }) => {
        expect(body.artwork.length).toBe(1);
        expect(body.artwork[0].id).toBe(161);
      });
  });
});

describe("POST /api/register", () => {
  test("201: created user", () => {
    const postUser = {
      username: "user1",
      email: "test@test.com",
      password: "SecurePass!2024",
    };
    return request(app)
      .post("/api/register")
      .send(postUser)
      .expect(201)
      .then((response) => {
        expect(response.body.user.username).toBe(postUser.username);
      });
  });
});

describe("POST /api/login", () => {
  test("201: user logged in", () => {
    const postUser = {
      username: "testuser1",
      password: "pass123",
    };
    return request(app)
      .post("/api/login")
      .send(postUser)
      .expect(200)
      .then((response) => {
        expect(response.body.user.username).toBe(postUser.username);
      });
  });
  test("401: user enters invalid username", () => {
    const postUser = {
      username: "testuserrr",
      password: "pass123",
    };
    return request(app)
      .post("/api/login")
      .send(postUser)
      .expect(401)
      .then((response) => {
        expect(response.body.message).toBe("Username not found");
      });
  });
  test("401: user enters invalid password", () => {
    const postUser = {
      username: "testuser1",
      password: "password",
    };
    return request(app)
      .post("/api/login")
      .send(postUser)
      .expect(401)
      .then((response) => {
        expect(response.body.message).toBe("Invalid password");
      });
  });
});

describe("GET /api/dashboard", () => {
  test("200: user logged in and success message if token is valid", () => {
    const testUser = {
      id: 1,
      username: "testuser1",
    };
    const token = jwt.sign(testUser, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return request(app)
      .get("/api/dashboard")
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .then((response) => {
        expect(response.body.message).toBe("Welcome back, testuser1");
      });
  });
});

describe("GET /api/artworks/:id", () => {
  test("200: responds with an object containing the requested artwork", () => {
    return request(app)
      .get("/api/artworks/161")
      .expect(200)
      .then(({ body }) => {
        expect(body.artwork[0].id).toBe(161);
      });
  });
});

describe("GET /api/user/exhibitions", () => {
  test("200: responds with an object containing the requested artwork", () => {
    return request(app)
      .get("/api/user/exhibitions")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(body.exhibitions.length).toBe(2);
      });
  });
});

describe("POST/api/user/exhibitions", () => {
  test("201: created new exhibition", () => {
    const postExhibition = {
      title: "My New Exhibition",
      description: "A few cool pieces I like",
    };
    return request(app)
      .post("/api/user/exhibitions")
      .send(postExhibition)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(201)
      .then(({ body }) => {
        expect(body.exhibition.title).toBe(postExhibition.title);
      });
  });
});

describe("POST /api/user/exhibitions/:id/artworks", () => {
  test("201: saves an artwork to an exhibition", () => {
    const artworkToSave = {
      artwork_id: 3001,
      title: "Sunset in Blue",
      artist: "Imani Ellis",
      image_id: "abc123xyz789",
    };
    return request(app)
      .post("/api/user/exhibitions/1/artwork")
      .send(artworkToSave)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(201)
      .then(({ body }) => {
        expect(body.updatedExhibition.exhibition_id).toBe(1);
        expect(body.updatedExhibition.artwork_id).toBe(
          artworkToSave.artwork_id
        );
      });
  });
  test("400: Bad request if insufficent details are sent", () => {
    const artworkToSave = {
      artwork_id: 3001,
      artist: "Imani Ellis",
      image_id: "abc123xyz789",
    };
    return request(app)
      .post("/api/user/exhibitions/1/artwork")
      .send(artworkToSave)
      .set("Authorization", `Bearer ${userToken}`)
      .expect(400)
      .then(({ body }) => {
        expect(body.message).toBe("Bad request.");
      });
  });
});

describe("GET /api/user/exhibitions/:exhibition_id/artworks", () => {
  test("200: returns artworks saved to a specific exhibition", () => {
    return request(app)
      .get("/api/user/exhibitions/1/artworks")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(body.exhibition[0]).toHaveProperty("artwork_id");
        expect(body.exhibition[0]).toHaveProperty("title");
        expect(body.exhibition[0]).toHaveProperty("artist");
        expect(body.exhibition[0]).toHaveProperty("image_id");
      });
  });
});

describe("DELETE /api/user/exhibitions/:exhibition_id", () => {
  test("204: deletes exhibition with the given exhibition id", () => {
    return request(app)
      .delete("/api/user/exhibitions/2")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(204)
      .then((response) => {
        expect(response.body).toEqual({});
      });
  });
});

describe("GET /api/user/exhibitions/artworks", () => {
  test("200: returns all saved artworks", () => {
    return request(app)
      .get("/api/user/exhibitions/artworks")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(body.savedArtworks.length).toBe(5);
      });
  });
});

describe("GET /api/user/exhibitions/artworks", () => {
  test("200: returns all saved artworks", () => {
    return request(app)
      .get("/api/user/exhibitions/artworks")
      .set("Authorization", `Bearer ${userToken}`)
      .expect(200)
      .then(({ body }) => {
        expect(body.savedArtworks.length).toBe(5);
      });
  });
});

describe("GET /api/exhibitions/guest-artworks", () => {
  const guestSessionId = "11111111-1111-1111-1111-111111111111";
  beforeEach(() => {
    return db.query(
      `
          INSERT INTO exhibition_artworks (artwork_id, title, artist, image_id, guest_session_id)
          VALUES (9999, 'Guest Test Art', 'Guest Artist', 'image123', $1)
        `,
      [guestSessionId]
    );
  });

  test("200: gets guest's saved artworks", () => {
    return request(app)
      .get("/api/exhibitions/guest-artworks")
      .query({ guest_session_id: guestSessionId })
      .expect(200)
      .then(({ body }) => {
        expect(Array.isArray(body.savedArtworks)).toBe(true);
        expect(body.savedArtworks.length).toBe(1);
        expect(body.savedArtworks[0]).toHaveProperty(
          "guest_session_id",
          guestSessionId
        );
      });
  });
});

describe("POST /api/exhibitions/guest-artworks", () => {
  const guestSessionId = "11111111-1111-1111-1111-111111111111";
  const guestArtwork = {
    artwork_id: 4444,
    title: "Guest Test Piece",
    artist: "Guest Artist",
    image_id: "guest-image-4444",
    guest_session_id: guestSessionId,
  };
  test("201: saves artwork for guest", () => {
    return request(app)
      .post("/api/exhibitions/guest-artworks")
      .send(guestArtwork)
      .expect(201)
      .then(({ body }) => {
        expect(body.savedArtwork.artwork_id).toBe(4444);
        expect(body.savedArtwork).toHaveProperty(
          "guest_session_id",
          guestSessionId
        );
      });
  });
});

describe("DELETE /api/exhibitions/guest-artworks/:artwork_id", () => {
  const guestSessionId = "11111111-1111-1111-1111-111111111111";
  beforeEach(() => {
    return db.query(
      `
        INSERT INTO exhibition_artworks (artwork_id, title, artist, image_id, guest_session_id)
        VALUES (9999, 'Guest Test Art', 'Guest Artist', 'image123', $1)
      `,
      [guestSessionId]
    );
  });

  test("204: removes guest artwork", () => {
    return request(app)
      .delete(`/api/exhibitions/guest-artworks/9999`)
      .query({ guest_session_id: guestSessionId })
      .expect(204)
      .then(({ body }) => {
        expect(body).toEqual({});
      });
  });
});

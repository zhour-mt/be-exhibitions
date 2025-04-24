const app = require("../app");
const request = require("supertest");

const seed = require("../db/seed/seed");


const { artworkData, userData } = require("../db/test-db/test-data/index");
const db = require("../db/connection");

beforeEach(() => {
  return seed(artworkData, userData);
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

describe("/api/register", () => {
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

describe("/api/login", () => {
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
});


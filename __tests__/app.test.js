const app = require("../app");
const request = require("supertest");

const seed = require("../db/seed/seed");

const { artworkData } = require("../db/test-db/test-data/index");
const db = require("../db/connection");

beforeEach(() => {
  return seed(artworkData);
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

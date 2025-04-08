const app = require("../app")
const request = require("supertest");

describe("Test API", () => {
    test("receive response from test api", () => {
        return request(app)
        .get("/api/test")
        .expect(200)
        .then(({body}) => {
            expect(body.message).toBe("Hello from the backend API!")
        })
    })
})
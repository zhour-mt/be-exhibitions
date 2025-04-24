const { makeUser, loginUser } = require("../models/user-models");
const jwt = require("jsonwebtoken");

require("dotenv").config({
  path: `${__dirname}/../.env.${process.env.NODE_ENV || "development"}`,
});

exports.registerUser = (request, response, next) => {
  const { username, email, password } = request.body;

  makeUser({ username, email, password })
    .then((newUser) => {
      console.log(newUser);
      response.status(201).send({ user: newUser });
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
};

exports.handleLogin = (request, response, next) => {
  const { username, password } = request.body;

  loginUser({ username, password })
    .then((user) => {
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not set in environment variables!");
      }
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      response.status(200).send({ user, token });
    })
    .catch((err) => {
      next(err);
    });
};

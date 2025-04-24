const { makeUser, loginUser } = require("../models/user-models");

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
      const token = jwt.sign(
        { id: user.id, username: user.username },
        "privatekey",
        { expiresIn: "1h" }
      );

      response.status(200).send({ user, token });
    })
    .catch((err) => {
      next(err);
    });
};

const { makeUser, loginUser } = require("../models/user-models");

exports.registerUser = (request, response, next) => {
  const { username, email, password } = request.body;

  makeUser({ username, email, password })
    .then((newUser) => {
      response.status(201).send({ user: newUser });
    })
    .catch((err) => {
      next(err);
    });
};

exports.handleLogin = (request, response, next) => {
  const {username, password} = request.body
  
  loginUser({username, password}).then((user) => {
    response.status(200).send({ user });
  }).catch(next)

}

const { request } = require("express");
const db = require("../db/connection");
const bcrypt = require("bcrypt");
const format = require("pg-format");

exports.makeUser = ({ username, email, password }) => {
  const existingUserQuery = `SELECT * FROM users WHERE email=$1 OR username=$2`;
  return db
    .query(existingUserQuery, [email, username])
    .then((response) => {
      if (response.rows.length > 0) {
        return Promise.reject({
          status: 409,
          message: "User already exists.",
        });
      }

      return bcrypt.hash(password, 10);
    })
    .then((response) => {
      const hashedPassword = response;
      const insertUserQuery =
        "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email";

      return db.query(insertUserQuery, [username, email, hashedPassword]);
    })
    .then((result) => {
      return result.rows[0];
    });
};

exports.loginUser = ({ username, password }) => {
  return db
    .query(`SELECT * FROM users WHERE username=$1`, [username])
    .then((result) => {
      const user = result.rows[0];
      if (!user) {
        return Promise.reject({ status: 401, message: "Username not found" });
      }
      return bcrypt.compare(password, user.password_hash).then((response) => {
        if (!response) {
          return Promise.reject({ status: 401, message: "Invalid password" });
        }
        const { password_hash, ...safeUser } = user;
        return safeUser;
      });
    });
};


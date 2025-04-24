const jwt = require("jsonwebtoken");

require("dotenv").config({
  path: `${__dirname}/../.env.${process.env.NODE_ENV || "development"}`
});

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  })
    .then((decoded) => {
      req.user = decoded;
      next();
    })
    .catch(() => {
      res.status(403).json({ message: "Invalid or expired token" });
    });
};

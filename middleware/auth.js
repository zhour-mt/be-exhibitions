const jwt = require("jsonwebtoken");
require("dotenv").config({
  path: `${__dirname}/../.env.${process.env.NODE_ENV || "development"}`,
});

exports.verifyToken = (request, response, next) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return response.status(403).json({ message: "Invalid or expired token" });
    }
    
    request.user = decoded;
    
    next();
  });

};


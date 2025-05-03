const jwt = require("jsonwebtoken");
const axios = require("axios");

require("dotenv").config({
  path: `${__dirname}/../.env.${process.env.NODE_ENV || "development"}`
});



// const token= "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OCwidXNlcm5hbWUiOiJkZXZ1c2VyMyIsImlhdCI6MTc0NjA0ODYyOCwiZXhwIjoxNzQ2MDUyMjI4fQ.XtyUtb_1rh_eubvmQXEbV_ck4aXuhLcX-rftqbIOtVo"


// axios.get('http://localhost:9000/api/dashboard', {
//   headers: {
//     Authorisation: `Bearer ${token}`
//   }
// })
// .catch(error => {
//   console.error(error);
// });



exports.verifyToken = (request, response, next) => {
  const authHeader = request.headers.authorisation

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.status(401).json({ message: "Missing or invalid token" });
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
      request.user = decoded;
      next();
    })
    .catch(() => {
      response.status(403).json({ message: "Invalid or expired token" });
    });
};

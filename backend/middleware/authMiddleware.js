
// const jwt = require("jsonwebtoken")

// const SECRET = "uber_secret_key"

// module.exports = (req, res, next) => {

//   const authHeader = req.headers.authorization

//   if (!authHeader) {
//     return res.status(401).json("No token provided")
//   }

//   const token = authHeader.split(" ")[1]

//   try {

//     const decoded = jwt.verify(token, SECRET)

//     req.user = decoded   // contains id and role

//     next()

//   } catch (err) {

//     return res.status(401).json("Invalid token")

//   }

// }

const jwt = require("jsonwebtoken");

const SECRET = "uber_secret_key";

module.exports = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json("No token provided");
  }

  const token = authHeader.split(" ")[1];

  try {

    const decoded = jwt.verify(token, SECRET);

    // attach user info to request
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();

  } catch (err) {

    console.error("Invalid token:", err);
    return res.status(401).json("Invalid token");

  }

};
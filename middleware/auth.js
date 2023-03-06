
const jwt = require("jsonwebtoken");

const secret=process.env.token
verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];
  //console.log(token)
    if (!token) {
      return res.status(403).send({ message: "No token provided!" });
    }
  
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: "Unauthorized!" });
      }
      
      req.userId = decoded.id;
      //return token;
      next();

    });
  };

module.exports = verifyToken
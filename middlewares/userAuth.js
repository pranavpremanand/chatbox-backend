const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    let token;
      token = req.headers.authorization
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.log("error",err);
        return res.status(401).send({
          message: "AUTH FAILED",
          success: false,
        });
      } else {
        req.userId = decoded.id;
        next();
      }
    });
  } catch (err) {
    console.log('JWT ERROR OCCURED',err);
    return res.status(401).send({
      message: "Auth failed",
      success: false,
    });
  }
};

const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
  try {
    let token;
    // console.log(req.headers)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.log("error",err);
        return res.status(401).send({
          message: "Auth failed",
          success: false,
        });
      } else {
        req.body.userId = decoded.id;
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

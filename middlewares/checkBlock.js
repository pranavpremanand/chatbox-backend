const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

exports.checkStatus = async (req, res, next) => {
  try {
    const user = await userModel.findOne({ _id: req.userId });
    if (user.isActive) {
      next();
    } else {
        res.status(404).json({blocked:true})
    }
  } catch (err) {
    res.status(500).send(err);
  }
};
exports.checkUserStatus = async (req, res, next) => {
  try {
    const user = await userModel.findOne({ _id: req.params.userId });
    if (user.isActive) {
        res.status(200).json({blocked:false})
    } else {
        res.status(200).json({blocked:true})
    }
  } catch (err) {
    console.log(err)
    res.status(500).send(err);
  }
};

exports.checkUserBlock = async (req, res) => {
  try {
    const { accessToken, user } = req.body;
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.log("error", err);
        return res.status(401).send({
          message: "AUTH FAILED",
          success: false,
        });
      } else {
        req.userId = decoded.id;
        if (user.isActive) {
          res.status(200).json({
            user: user,
            accessToken: accessToken,
            success: true,
          });
        }else{
            res.status(404).json({blocked:true})
        }
        // this.checkStatus(req,res).then(()=>{
        //     res.status(200).json({
        //       user: user,
        //       accessToken: accessToken,
        //       success: true,
        //     });
        // })
      }
    });
  } catch (err) {
    console.log("JWT ERROR OCCURED", err);
    return res.status(401).send({
      message: "Auth failed",
      success: false,
    });
  }
};

const adminHelper = require("../helpers/adminHelper");
const postModel = require("../models/postModel");
const reportModel = require("../models/reportModel");
const userModel = require("../models/userModel");

// Do admin login
exports.doAdminLogin = (req, res) => {
  adminHelper
    .doAdminLogin(req.body)
    .then((response) => {
      if (response.admin) {
        // res.cookie('jwt',response.refreshToken,{httpOnly:true,maxAge:24*60*60*1000})
        res.status(200).send({
          data: response.admin,
          accessToken: response.accessToken,
          success: true,
        });
      } else {
        res.status(200).send({ message: response.message, success: false });
      }
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Something went wrong. Try again.", err });
    });
};

//Get users
exports.getUsers = async (req, res) => {
  try {
    const users = await userModel.find(
        // { _id: { $ne: req.admin } }
        );
    const admin = await userModel.findOne({ _id: req.admin });
    res.status(200).json({ users, admin });
  } catch (err) {
    res.status(500).json(err);
  }
};

//Block or Unblock user
exports.blockUser = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.params.userId });
    if (user.isActive) {
      await userModel.updateOne(
        { _id: req.params.userId },
        { $set: { isActive: false } }
      );
      res.status(200).json({ blocked: true });
    } else {
      await userModel.updateOne(
        { _id: req.params.userId },
        { $set: { isActive: true } }
      );
      res.status(200).json({ blocked: false });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

//Get reported posts
exports.getReportedPosts = async (req, res) => {
  try {
    const posts = await reportModel
      .find({ isDeleted: false })
      .populate(["postId", "reports.userId"])
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

//Delete reported post
exports.deletePost = async (req, res) => {
  try {
    await postModel.updateOne(
      { _id: req.params.id },
      { $set: { isDeleted: true } }
    );
    await reportModel.updateOne(
      { postId: req.params.id },
      { $set: { isDeleted: true } }
    );
    res.status(200).json(true);
  } catch (err) {
    res.status(500).json(err);
  }
};

//Ignore reported post
exports.ignorePost = async (req, res) => {
  try {
    await reportModel.deleteOne({ postId: req.params.id });
    res.status(200).json(true);
  } catch (err) {
    res.status(500).json(err);
  }
};

//Accept verification request
exports.acceptVerificationRequest = async (req, res) => {
  try {
    await userModel.updateOne(
      { _id: req.params.userId },
      { $set: { verifiedUser: true, verificationRequest: false } }
    );
    res.status(201).json(true);
  } catch (err) {
    res.status(500).json(err);
  }
};

const { default: mongoose } = require("mongoose");
const userHelper = require("../helpers/userHelper");
const postModel = require("../models/postModel");
const { updateOne } = require("../models/userModel");
const user = require("../models/userModel");
const userModel = require("../models/userModel");
const {
  validateEmail,
  validateLength,
  validateWordCount,
} = require("../helpers/validation");
const otpHelper = require("../services/userOtpService");
const reportModel = require("../models/reportModel");
const bcrypt = require("bcrypt");
const savedPostModel = require("../models/savedPostModel");

//Send OTP
exports.sendOtp = async (req, res) => {
  try {
    const { email, username, fullName, password } = req.body;
    const emailExist = await userModel.findOne({ email: email });
    const usernameExist = await userModel.findOne({ username: username });
    if (emailExist) {
      res.status(200).send({ message: "Email already exist", success: false });
    } else if (usernameExist) {
      res
        .status(200)
        .send({ message: "Username already exist", success: false });
    } else {
      otpHelper
        .sendOtp(email)
        .then((response) => {
          res
            .status(200)
            .send({ message: "OTP sent", response: response, success: true });
        })
        .catch((err) => console.log("ERROR", err));
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ success: false });
  }
};

//Forgot password - send OTP
exports.sendLoginOtp = async (req, res) => {
  try {
    console.log(req.body);
    const user = await userModel.findOne({ email: req.body.email });
    if (user) {
      const response = await otpHelper.sendOtp(user.email);
      if (response) {
        res
          .status(200)
          .json({ message: "OTP sent", response: response, success: true });
      }
    } else {
      res.status(200).json({ message: "User does not exist" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

//Change password
exports.changePassword = async (req, res) => {
  let { email, newPassword } = req.body;
  try {
    newPassword = await bcrypt.hash(newPassword, 10);
    const user = await userModel.findOneAndUpdate(
      { email: email },
      { $set: { password: newPassword } }
    );
    res.status(204).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

//Do signup
exports.doSignup = (req, res) => {
  userHelper
    .doSignup(req.body)
    .then((response) => {
      res.status(200).send({ message: response.message, success: true });
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Something went wrong.", success: false, err });
    });
};

//Do login
exports.doLogin = (req, res, next) => {
  userHelper
    .doLogin(req.body)
    .then((response) => {
      if (response.user) {
        console.log("user exist");
        res.status(200).send(response);
      } else {
        console.log("no user here");
        res.status(200).send({ message: response.message, success: false });
      }
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .send({ message: "Something went wrong. Try again.", err });
    });
};

//Get user info
exports.getUserInfo = async (req, res) => {
  try {
    // console.log(req.userId,'USER ID Here')
    const user = await userModel.findOne({ id: req.userId });
    if (!user) {
      res.status(200).send({ message: "User does not exist", success: false });
    } else {
      res.status(200).send({
        message: "User found",
        success: true,
        data: user,
      });
    }
  } catch (err) {
    res
      .status(500)
      .send({ message: "Error getting user", success: false, err });
  }
};

//Upload post
exports.uploadPost = async (req, res, next) => {
  const data = {
    image: req.body.image,
    description: req.body.postData.description,
    userId: req.userId,
  };
  const post = new postModel(data);
  await post
    .save()
    .then(async () => {
      const user = await userModel.findOne({ id: data.userId });
      res.status(200).send({ success: true, user: user });
    })
    .catch((err) => {
      res.status(500).send({ success: false });
      console.log("ERROR", err);
    });
};

//Get posts
exports.getPosts = async (req, res, next) => {
  const posts = await userModel.aggregate([
    {
      $lookup: {
        from: "posts",
        localField: "_id",
        foreignField: "userId",
        as: "posts",
      },
    },
    {
      $project: {
        username: 1,
        fullName: 1,
        posts: 1,
        profilePic: 1,
        verifiedUser: 1,
      },
    },
    {
      $unwind: {
        path: "$posts",
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        profilePic: 1,
        posts: 1,
        verifiedUser: 1,
        isLiked: {
          $in: [mongoose.Types.ObjectId(req.userId), "$posts.likedUsers"],
        },
        reported: {
          $in: [mongoose.Types.ObjectId(req.userId), "$posts.reportedUsers"],
        },
      },
    },
    {
      $sort: {
        "posts.createdAt": -1,
      },
    },
  ]);
  const savedPosts = await savedPostModel
    .findOne({ userId: req.userId })
    .populate({path:'savedPosts',populate:"post"}).populate("userId");
  const user = await userModel.findOne({ _id: req.userId });
  res.status(200).send({ posts: posts, user: user, savedPosts: savedPosts });
};

//Delete post
exports.deletePost = async (req, res, next) => {
  try {
    // console.log(req.params.id);
    const post = await postModel.findOne({ _id: req.params.id });
    let response = {};
    const userId = post.userId.toString();
    console.log(userId, "USERID", req.userId);
    if (userId === req.userId) {
      response = await postModel.updateOne(
        { _id: req.params.id },
        { $set: { isDeleted: true } }
      );
      res
        .status(200)
        .send({ message: "Post deleted successfully", success: true });
    } else {
      res
        .status(200)
        .send({ message: `You can't delete posts of others`, success: false });
    }
  } catch (err) {
    res.status(500).send({ success: false });
  }
};

//Get not following users data
exports.getUsersData = async (req, res, next) => {
  try {
    let user = await userModel.findOne({ _id: req.userId });
    user = user.following;
    const users = await userModel.find({
      $and: [{ _id: { $ne: req.userId } }, { _id: { $nin: user } }],
    });
    // console.log(users);
    if (users) {
      res.status(200).send({ success: true, data: users });
    } else {
      res.status(200).send({ success: false });
    }
  } catch (err) {
    res.status(500).send({ success: false });
  }
};
//Get all users
exports.getAllUsers = async (req, res, next) => {
  try {
    let user = await userModel.findOne({ _id: req.userId });
    user = user.following;
    const users = await userModel.find({ _id: { $ne: req.userId } });
    // console.log(users);
    if (users) {
      res.status(200).send({ success: true, data: users });
    } else {
      res.status(200).send({ success: false });
    }
  } catch (err) {
    res.status(500).send({ success: false });
  }
};

//Follow user
exports.followUser = async (req, res) => {
  try {
    let user = await userModel.findOne({ _id: req.params.id });
    if (user.followers?.length === 5) {
      const verifyMessage = {
        content: `You've achieved ${user.followers?.length} followers.\nNow you can request from your profile to get verified`,
        date: new Date(),
        seen: false,
      };
      const verifyMessageExist = await userModel.findOne({
        $and: [
          { _id: user.id },
          {
            $or: [
              { "unseenNotifications.content": verifyMessage.content },
              { "seenNotifications.content": verifyMessage.content },
            ],
          },
        ],
      });
      if (!verifyMessageExist) {
        console.log("no msg exist");
        await userModel.updateOne(
          { _id: user.id },
          { $push: { unseenNotifications: verifyMessage } }
        );
      }
    }

    user = { ...user, isFollowed: true };
    await userModel
      .updateOne(
        { _id: req.userId },
        { $addToSet: { following: req.params.id } }
      )
      .then(async () => {
        await userModel
          .updateOne(
            { _id: req.params.id },
            { $addToSet: { followers: req.userId } }
          )
          .then(async () => {
            const data = {
              content: `started following you`,
              userId: req.userId,
              date: new Date(),
              seen: false,
            };
            await userModel.updateOne(
              { _id: req.params.id },
              { $push: { unseenNotifications: data } }
            );
            // const users = await userModel.find({_id:{$ne:req.userId}})
            res.status(200).send({ success: true, user: user });
          })
          .catch((err) => {
            res.status(200).send({ success: false });
          });
      })
      .catch((err) => {
        res.status(200).send({ success: false });
      });
  } catch (err) {
    console.log(err);
    res.status(500).send({ success: false });
  }
};

//Get following users
exports.getFollowingUsers = async (req, res) => {
  try {
    // console.log(req.userId);

    const users = await userModel.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.userId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "following",
          foreignField: "_id",
          as: "result",
          pipeline: [
            {
              $project: {
                isFollowed: {
                  $in: [mongoose.Types.ObjectId(req.userId), "$followers"],
                },
                profilePic: 1,
                fullName: 1,
                username: 1,
                _id: 1,
                verifiedUser: 1,
              },
            },
          ],
        },
      },
    ]);

    if (users) {
      res.status(200).send({ success: true, users: users });
    } else {
      res.status(200).send({ success: false });
    }
  } catch (err) {
    res.status(500).send({ success: false });
  }
};

//Get followers
exports.getFollowers = async (req, res) => {
  try {
    // console.log(req.userId);

    const users = await userModel.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.userId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "followers",
          foreignField: "_id",
          as: "result",
          pipeline: [
            {
              $project: {
                isFollowed: {
                  $in: [mongoose.Types.ObjectId(req.userId), "$following"],
                },
                profilePic: 1,
                fullName: 1,
                username: 1,
                _id: 1,
                verifiedUser: 1,
              },
            },
          ],
        },
      },
    ]);
    if (users) {
      res.status(200).send({ success: true, users: users });
    } else {
      res.status(200).send({ success: false });
    }
  } catch (err) {
    res.status(500).send({ success: false });
  }
};

//Unfollow user
exports.unfollowUser = async (req, res) => {
  try {
    let user = await userModel.findOne({ _id: req.params.id });
    // let loggedUser = await userModel.findOne({_id:req.userId})
    user = { ...user, isFollowed: false };
    await userModel
      .updateOne({ _id: req.userId }, { $pull: { following: req.params.id } })
      .then(async (response) => {
        await userModel.updateOne(
          { _id: req.params.id },
          {
            $pull: {
              unseenNotifications: {
                $and: [
                  { content: `started following you` },
                  { userId: req.userId },
                ],
              },
            },
          }
        );
        await userModel.updateOne(
          { _id: req.params.userId },
          { $pull: { followers: req.body.id } }
        );
        if (response) {
          res.status(200).send({ success: true, user: user });
        } else {
          res.status(200).send({ success: false });
        }
      })
      .catch((err) => {
        res.status(500).send({ success: false });
      });
  } catch (err) {
    res.status(500).send({ success: false });
  }
};

//Get who to follow
exports.getOtherUsers = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.userId });
    const notInFollowing = await userModel.find({
      $nor: [{ _id: user._id }, { _id: [...user.following] }],
    });
    res.status(200).send({ success: true, users: notInFollowing });
  } catch (err) {
    res.status(500).send({ success: false });
  }
};

//Like post
exports.likePost = async (req, res) => {
  try {
    const liked = await postModel.findOne({
      $and: [{ _id: req.params.postId }, { likedUsers: req.userId }],
    });
    const post = await postModel.findOne({ _id: req.params.postId });
    // const loggedUser =await userModel.findOne({_id:req.userId})
    // console.log(liked);
    if (!liked) {
      const data = {
        content: `liked your post`,
        userId: req.userId,
        postId: req.params.postId,
        date: new Date(),
        seen: false,
      };

      // console.log(post.userId + " | " + req.userId);

      if (post.userId !== req.userId) {
        await userModel.updateOne(
          { _id: post.userId },
          { $push: { unseenNotifications: data } }
        );
      }

      await postModel.updateOne(
        { _id: req.params.postId },
        { $push: { likedUsers: req.userId } }
      );
      res.status(200).send({ success: true, liked: true });
    } else {
      await postModel.updateOne(
        { _id: req.params.postId },
        { $pull: { likedUsers: req.userId } }
      );
      if (post.userId !== req.userId) {
        await userModel.updateOne(
          { _id: post.userId },
          {
            $pull: {
              unseenNotifications: {
                $and: [{ postId: req.params.postId }, { userId: req.userId }],
              },
            },
          }
        );
      }
      res.status(200).send({ success: true, unliked: true });
    }
  } catch (err) {
    res.status(500).send({ success: false });
  }
};

//Add comment
exports.addComment = async (req, res) => {
  try {
    const comment = {
      userId: req.userId,
      content: req.body.comment,
      date: new Date(),
    };
    const data = {
      content: `commented on your post`,
      userId: req.userId,
      postId: req.params.postId,
      date: new Date(),
      seen: false,
    };
    const userOfPost = await postModel.findOne({ _id: req.params.postId });
    await postModel
      .updateOne({ _id: req.params.postId }, { $push: { comments: comment } })
      .then(async (response) => {
        if (userOfPost.userId !== req.userId) {
          await userModel.updateOne(
            { _id: userOfPost.userId },
            { $push: { unseenNotifications: data } }
          );
        }
        res.status(200).send({ success: true });
      })
      .catch((err) => {
        res.status(200).send({ success: false });
      });
  } catch (err) {
    res.status(500).send({ success: false });
  }
};

//Get comments
exports.getComments = async (req, res) => {
  try {
    // console.log("POST ID", req.params.postId);
    const comments = await postModel
      .findOne({ _id: req.params.postId })
      .populate({ path: "comments", populate: "userId" })
      .sort({ "comments.date": -1 });
    if (comments) {
      res.status(200).send({ success: true, comments: comments });
    } else {
      res.status(200).send({ success: false });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ success: false });
  }
};

//Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const response = await postModel.updateOne(
      { _id: req.params.postId },
      { $pull: { comments: { _id: req.params.commentId } } }
    );
    const post = await postModel.findOne({ _id: req.params.postId });
    if (response) {
      res.status(200).send({ success: true });
    } else {
      res.status(200).send({ success: false });
    }
  } catch (err) {
    res.status(500).send({ success: false });
  }
};

//Get user posts
exports.getUserPosts = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.params.userId });
    // const posts = await postModel.find({userId:req.userId})
    const posts = await userModel.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(req.params.userId) } },
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "userId",
          as: "posts",
        },
      },
      {
        $project: {
          username: 1,
          fullName: 1,
          posts: 1,
          profilePic: 1,
          verifiedUser: 1,
        },
      },
      {
        $unwind: {
          path: "$posts",
        },
      },
      {
        $project: {
          fullName: 1,
          username: 1,
          profilePic: 1,
          posts: 1,
          verifiedUser: 1,
          isLiked: {
            $in: [
              mongoose.Types.ObjectId(req.params.userId),
              "$posts.likedUsers",
            ],
          },
        },
      },
      {
        $sort: {
          "posts.createdAt": -1,
        },
      },
    ]);
    // console.log('SPOSTS',posts)
    if (posts) {
      res.status(200).send({ success: true, posts: posts, user: user });
    } else {
      res.status(200).send({ success: false });
    }
  } catch (err) {
    res.status(500).send({ success: false });
  }
};

//Get user photos
exports.getUserPhotos = async (req, res) => {
  try {
    const userPhotos = await postModel.find({ userId: req.params.userId });
    if (userPhotos) {
      res.status(200).send({ success: true, photos: userPhotos });
    } else {
      res.status(200).send({ success: false });
    }
  } catch (err) {
    res.status(500).send({ success: false });
  }
};

//Add cover pic
exports.addCover = async (req, res) => {
  try {
    // console.log('"HELLOOOOOOOOOOOOO', req.body);
    await userModel
      .updateOne({ _id: req.userId }, { $set: { coverPic: req.body.cover } })
      .then((response) => {
        // console.log("SUccess");
        res.status(200).send({ success: true });
      })
      .catch((err) => {
        // console.log("Failed");
        res.status(200).send({ success: false });
      });
  } catch (err) {
    res.status(500).send({ success: false });
  }
};

//Add profile pic
exports.addProfilePic = async (req, res) => {
  try {
    await userModel
      .updateOne(
        { _id: req.userId },
        { $set: { profilePic: req.body.profilePic } }
      )
      .then((response) => {
        res.status(200).send({ success: true });
      })
      .catch((err) => {
        res.status(200).send({ success: false });
        console.log(err);
      });
  } catch (err) {
    console.log(err);
    res.status(500).send({ success: false });
  }
};

//Update profile
exports.updateProfile = async (req, res) => {
  try {
    // console.log(req.body);
    await userModel
      .updateOne(
        { _id: req.userId },
        {
          $set: {
            // username:req.body.username,
            fullName:req.body.fullName,
            about: req.body.about,
            worksAt: req.body.worksAt,
            livesIn: req.body.livesIn,
            relationship: req.body.relationship,
          },
        }
      )
      .then((response) => {
        res.status(200).send({ success: true });
      })
      .catch((err) => {
        res.status(200).send({ success: false });
      });
  } catch (err) {
    res.status(500).send({ success: false });
  }
};

//Get user data
exports.getUser = async (req, res) => {
  try {
    const userData = await userModel.findOne({ _id: req.params.user });
    res.status(200).json(userData);
  } catch (err) {
    res.status(500).json(err);
  }
};

//Get Notifications
exports.getUnseenNotifications = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.userId }).populate({
      path: "unseenNotifications",
      populate: ["userId", "postId"],
    });
    // .sort({'unseenNotifications.date':-1});
    // const unseenNotifications = user.unseenNotifications.sort(
    //   (one, two) => two.date - one.date
    // );
    // const seenNotifications = user.seenNotifications.sort(
    //   (one, two) => two.date - one.date
    // );
    let notifications = user.unseenNotifications;
    // notifications = notifications.sort((one,two)=>two.date - one.date)
    // console.log(notifications,'notifications')
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json(err);
    console.log(err);
  }
};

//Seen Notifications
exports.seenNotifications = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.userId });
    await userModel.updateOne(
      { _id: req.userId },
      { $push: { seenNotifications: user.unseenNotifications } }
    );
    const data = await userModel
      .findOneAndUpdate(
        { _id: req.userId },
        { $unset: { unseenNotifications: [] } }
      )
      .populate({
        path: "seenNotifications",
        populate: ["userId", "postId"],
      });
    let notifications = data.seenNotifications;
    // user.unseenNotifications.concat(user.seenNotifications)
    notifications = notifications.sort((one, two) => two.date - one.date);
    //   var out="[";
    // for(var indx=0;indx<notifications.length-1;indx++){
    //   out+=JSON.stringify(notifications[indx],null,4)+",";
    // }
    // out+=JSON.stringify(notifications[notifications.length-1],null,4)+"]";
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

//Search user
exports.searchUser = async (req, res) => {
  try {
    const currentUser = await userModel.findOne({ _id: req.userId });
    const users = await userModel
      .find({
        $and: [
          { _id: { $ne: req.userId } },
          { username: { $regex: req.params.keywords } },
        ],
      })
      .lean();

    const data = users.map((user) => {
      let isFollowed = currentUser.following.includes(user._id);
      return { ...user, isFollowed: isFollowed };
    });
    // console.log(data,'data')

    res.status(200).json(data);
  } catch (err) {
    // console.log(err,'error')
    res.status(500).json(err);
  }
};

//Report post
exports.reportPost = async (req, res) => {
  
  const { postId, userId, reportType } = req.body;
  try {
    const post = await reportModel.findOne({ postId: postId });
    await postModel.updateOne(
      { _id: postId },
      { $addToSet: { reportedUsers: userId } }
    );
    let date = new Date().toString();
    date = date.slice(4, 15);
    if (!post) {
      const report = {
        postId: postId,
        reports: [{ userId: req.userId, type: reportType, date: date }],
      };
      const reportData = new reportModel(report);
      await reportData.save();
      res.status(201).json({ success: true });
    } else {
      const report = {
        type: reportType,
        userId: req.userId,
        date: date,
      };
      await reportModel.updateOne(
        { postId: postId },
        { $addToSet: { reports: report } }
      );
      res.status(200).json({ success: true });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

exports.requestVerification = async (req, res) => {
  try {
    await userModel.updateOne(
      { _id: req.params.userId },
      { $set: { verificationRequest: true } }
    );
    res.status(201).json(true);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

exports.saveOrUnsavePost = async (req, res) => {
  try {
    const savedPosts = await savedPostModel.findOne({ userId: req.userId });
    if (savedPosts) {
      if (savedPosts.savedPosts.some((val) => val.post == req.params.postId)) {
        console.log("unsaved");
        await savedPostModel.updateOne(
          { userId: req.userId },
          { $pull: { savedPosts: { post: req.params.postId } } }
        );
        res.status(200).json("unsaved");
      } else {
        const data = {
          post: [req.params.postId],
          date: new Date(),
        };
        await savedPostModel.updateOne(
          { userId: req.userId },
          { $push: { savedPosts: data } }
        );
        res.status(200).json("saved");
      }
    } else {
      const data = {
        userId: req.userId,
        savedPosts: [{ post: req.params.postId, date: new Date() }],
      };
      const newPost = savedPostModel(data);
      await newPost.save();
      res.status(201).json("saved");
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

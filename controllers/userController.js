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
    } else if (!validateEmail(email)) {
      res
        .status(200)
        .send({ message: "Invalid email address", success: false });
    } else if (!validateLength(username, 3, 16)) {
      res.status(200).send({
        message: "username required minimum 3 to 16 characters",
        success: false,
      });
    } else if (!validateLength(fullName, 3, 16)) {
      res.status(200).send({
        message: "Full name required minimum 3 to 16 characters",
        success: false,
      });
    } else if (!validateLength(password, 6, 16)) {
      res.status(200).send({
        message: "Password required minimum 3 to 16 characters",
        success: false,
      });
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
exports.doLogin = (req, res) => {
  userHelper
    .doLogin(req.body)
    .then((response) => {
      if (response.user) {
        res.status(200).send({
          user: response.user,
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

//Get user info
exports.getUserInfo = async (req, res) => {
  try {
    const user = await userModel.findOne({ id: req.body.userId });
    if (!user) {
      res.status(200).send({ message: "User does not exist", success: false });
    } else {
      res.status(200).send({
        message: "User found",
        success: true,
        data: user,
        //  {
        //   id: user.id,
        //   name: user.username,
        //   email: user.email,
        // },
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
    userId: req.body.userId,
  };
  console.log("DATA", data);
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
  console.log(req.body.userId, "USER ID");
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
        isLiked: {
          $in: [mongoose.Types.ObjectId(req.body.userId), "$posts.likedUsers"],
        },
      },
    },
    {
      $sort: {
        "posts.createdAt": -1,
      },
    },
  ]);
  res.status(200).send({ posts });
};

//Delete post
exports.deletePost = async (req, res, next) => {
  try {
    console.log(req.params.id);
    const post = await postModel.findOne({ _id: req.params.id });
    let response = {};
    if (post.userId === req.body.userId) {
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
    let user = await userModel.findOne({ _id: req.body.userId });
    user = user.following;
    const users = await userModel.find({
      $and: [{ _id: { $ne: req.body.userId } }, { _id: { $nin: user } }],
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
    let user = await userModel.findOne({ _id: req.body.userId });
    user = user.following;
    const users = await userModel.find({ _id: { $ne: req.body.userId } });
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
    // let loggedUser = await userModel.findOne({_id:req.body.userId})
    user = { ...user, isFollowed: true };
    await userModel
      .updateOne(
        { _id: req.body.userId },
        { $addToSet: { following: req.params.id } }
      )
      .then(async () => {
        await userModel
          .updateOne(
            { _id: req.params.id },
            { $addToSet: { followers: req.body.userId } }
          )
          .then(async () => {
            const data = {
              content: `started following you`,
              userId: req.body.userId,
              date: new Date(),
              seen: false,
            };
            await userModel.updateOne(
              { _id: req.params.id },
              { $push: { unseenNotifications: data } }
            );
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
    console.log(req.body.userId);

    const users = await userModel.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.body.userId),
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
                  $in: [mongoose.Types.ObjectId(req.body.userId), "$followers"],
                },
                profilePic: 1,
                fullName: 1,
                username: 1,
                _id: 1,
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
    console.log(req.body.userId);

    const users = await userModel.aggregate([
      {
        $match: {
          _id: mongoose.Types.ObjectId(req.body.userId),
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
                  $in: [mongoose.Types.ObjectId(req.body.userId), "$following"],
                },
                profilePic: 1,
                fullName: 1,
                username: 1,
                _id: 1,
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
    // let loggedUser = await userModel.findOne({_id:req.body.userId})
    user = { ...user, isFollowed: false };
    await userModel
      .updateOne(
        { _id: req.body.userId },
        { $pull: { following: req.params.id } }
      )
      .then(async (response) => {
        await userModel.updateOne(
          { _id: req.params.id },
          {
            $pull: {
              unseenNotifications: {
                $and: [
                  { content: `started following you` },
                  { userId: req.body.userId },
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
    const user = await userModel.findOne({ _id: req.body.userId });
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
      $and: [{ _id: req.params.postId }, { likedUsers: req.body.userId }],
    });
    const post = await postModel.findOne({ _id: req.params.postId });
    // const loggedUser =await userModel.findOne({_id:req.body.userId})
    console.log(liked);
    if (!liked) {
      const data = {
        content: `liked your post`,
        userId: req.body.userId,
        postId: req.params.postId,
        date: new Date(),
        seen: false,
      };

      console.log(post.userId + " | " + req.body.userId);

      if (post.userId !== req.body.userId) {
        await userModel.updateOne(
          { _id: post.userId },
          { $push: { unseenNotifications: data } }
        );
      }

      await postModel.updateOne(
        { _id: req.params.postId },
        { $push: { likedUsers: req.body.userId } }
      );

      console.log("LIKED");
      res.status(200).send({ success: true, liked: true });
    } else {
      await postModel.updateOne(
        { _id: req.params.postId },
        { $pull: { likedUsers: req.body.userId } }
      );
      if (post.userId !== req.body.userId) {
        await userModel.updateOne(
          { _id: post.userId },
          {
            $pull: {
              unseenNotifications: {
                $and: [
                  { postId: req.params.postId },
                  { userId: req.body.userId },
                ],
              },
            },
          }
        );
      }
      console.log("UNLIKED");
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
      userId: req.body.userId,
      content: req.body.comment,
      date: new Date(),
    };
    const data = {
      content: `commented on your post`,
      userId: req.body.userId,
      postId: req.params.postId,
      date: new Date(),
      seen: false,
    };
    const userOfPost = await postModel.findOne({ _id: req.params.postId });
    await postModel
      .updateOne({ _id: req.params.postId }, { $push: { comments: comment } })
      .then(async (response) => {
        if (userOfPost.userId !== req.body.userId) {
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
    console.log("POST ID", req.params.postId);
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
      // await userModel.updateOne(
      //   { _id: post.userId },
      //   {
      //     $pull: {
      //       unseenNotifications: {
      //         $and: [
      //           { content: "commented on your post" },
      //           { postId: req.params.postId },
      //         ],
      //       },
      //     },
      //   },
      //   {multi: false}
      // );
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
    const user = await userModel.findOne({ _id: req.body.userId });
    // const posts = await postModel.find({userId:req.body.userId})
    const posts = await userModel.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(req.body.userId) } },
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
          isLiked: {
            $in: [
              mongoose.Types.ObjectId(req.body.userId),
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
    const userPhotos = await postModel.find({ userId: req.body.userId });
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
    console.log('"HELLOOOOOOOOOOOOO', req.body);
    await userModel
      .updateOne(
        { _id: req.body.userId },
        { $set: { coverPic: req.body.cover } }
      )
      .then((response) => {
        console.log("SUccess");
        res.status(200).send({ success: true });
      })
      .catch((err) => {
        console.log("Failed");
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
        { _id: req.body.userId },
        { $set: { profilePic: req.body.profilePic } }
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

//Update profile
exports.updateProfile = async (req, res) => {
  try {
    console.log(req.body);
    await userModel
      .updateOne(
        { _id: req.body.userId },
        {
          $set: {
            // username:req.body.username,
            // fullName:req.body.fullName,
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
    const user = await userModel.findOne({ _id: req.body.userId }).populate({
      path: "unseenNotifications",
      populate: ["userId", "postId"],
    })
    // .sort({'unseenNotifications.date':-1});
    // const unseenNotifications = user.unseenNotifications.sort(
    //   (one, two) => two.date - one.date
    // );
    // const seenNotifications = user.seenNotifications.sort(
    //   (one, two) => two.date - one.date
    // );
    let notifications=user.unseenNotifications
    // notifications = notifications.sort((one,two)=>two.date - one.date)
    // console.log(notifications,'notifications')
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json(err);
    console.log(err)
  }
};

//Seen Notifications
exports.seenNotifications = async (req, res) => {
  try {
    let user = await userModel.findOne({ _id: req.body.userId });
    user = await userModel.findOneAndUpdate(
      { _id: req.body.userId },
      { $push: { seenNotifications: user.unseenNotifications } }
    ).populate({
      path: "seenNotifications",
      populate: ["userId", "postId"],
    })
     await userModel.updateOne(
      { _id: req.body.userId },
      { $unset: { unseenNotifications: [] } }
    );
    let notifications=user.seenNotifications
    // user.unseenNotifications.concat(user.seenNotifications)
    // notifications = notifications.sort((one,two)=>two.date - one.date)
    console.log(notifications,'notifications')
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json(err);
  }
};

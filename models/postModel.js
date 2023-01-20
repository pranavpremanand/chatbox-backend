const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    reportedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    comments: [
      {
        content: {
          type: String,
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "users",
        },
        date: {
          type: Date,
          default: new Date(),
        },
        // replies: [
        //   {
        //     content: {
        //       type: String,
        //     },
        //     userId: {
        //       type: mongoose.Schema.Types.ObjectId,
        //       ref: "users",
        //     },
        //     date: {
        //       type: Date,
        //       default: new Date(),
        //     },
        //   },
        // ],
        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
          },
        ],
      },
    ],
    // reactions: [
    //   {
    //     rType: {
    //       type: String,
    //     },
    //     userId: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "users",
    //     },
    //   },
    // ],
    likedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const postModel = mongoose.model("posts", postSchema);
module.exports = postModel;

const mongoose = require("mongoose");

const savedPostSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  savedPosts: [
    {
      post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "posts",
    },
    date:Date
    },
  ],
});
const savedPostModel = mongoose.model("savedPosts", savedPostSchema);
module.exports = savedPostModel;

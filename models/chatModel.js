const mongoose = require("mongoose");

const chatSchema = mongoose.Schema(
  {
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  },
  { timestamps: true }
);

const chatModel = mongoose.model("chats", chatSchema);
module.exports = chatModel;

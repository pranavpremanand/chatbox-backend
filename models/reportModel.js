const mongoose = require("mongoose");

const reportSchema = mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "posts",
    },
    reports: [
      {
        type: { type: String },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        date: { type: String },
      },
    ],
    isDeleted:{
        type:Boolean,
        default:false
    }
  },
  { timestamps: true }
);

const reportModel = mongoose.model("reports", reportSchema);
module.exports = reportModel;

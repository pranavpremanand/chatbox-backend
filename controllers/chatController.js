const chatModel = require("../models/chatModel");

exports.createChat = async (req, res) => {
  const newChat = new chatModel({
    members: [req.body.senderId, req.body.receiverId],
  });
  try {
    const result = await newChat.save();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.userChats = async (req, res) => {
  try {
    console.log(req.body.userId,'user')
    const chat = await chatModel.find({
      members: { $in: [req.body.userId] },
    });
    console.log("CHAT",chat)
    res.status(200).json({chats:chat,userId:req.body.userId});
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.findChat = async (req, res) => {
  try {
    const { firstId, secondId } = req.params;
    const chat = await chatModel.findOne({
      members: { $all: [firstId, secondId] },
    });
    res.status(200).json(chat)
  } catch (err) {
    res.status(500).json(err);
  }
};

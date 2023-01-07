const chatModel = require("../models/chatModel");
const userModel = require("../models/userModel");

exports.createChat = async (req, res) => {
  const newChat = new chatModel({
    members: [req.body.senderId, req.body.receiverId],
  });
  const exist =await chatModel.findOne({members:{$all:[req.body.senderId,req.body.receiverId]}})
  if(!exist){
    try {
      // console.log("NOT EXIST")
      const result = await newChat.save();
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json(err);
    }
  }else{
    // console.log("EXIST")
    res.status(200).json(exist);
  }
};

exports.userChats = async (req, res) => {
  try {
    // console.log(req.userId,'user')
    const chat = await chatModel.find({
      members: { $in: [req.userId] },
    });
    const user = await userModel.findOne({_id:req.userId})
    // console.log('USER',user)
    // console.log("CHAT",chat)
    res.status(200).json({chats:chat,user:user});
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.currentChat = async (req, res) => {
  try {
    // console.log(req.userId,'user')
    const chat = await chatModel.findOne({
      members: { $all: [req.userId,req.params.id] },
    });
    const user = await userModel.findOne({_id:req.userId})
    // console.log('USER',user)
    // console.log("CHAT",chat)
    res.status(200).json({chat});
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

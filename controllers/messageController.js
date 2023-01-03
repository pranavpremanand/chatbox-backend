const messageModel = require("../models/messageModel");

exports.addMessage = async (req, res) => {
  const { chatId, senderId, text } = req.body;
  const message = new messageModel({ chatId, senderId, text });
  try {
    const result = await message.save();
    // const messages = await messageModel.find({ chatId }).sort({createdAt:-1})
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const result = await messageModel.find({ chatId }).sort({createdAt:-1})
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
};

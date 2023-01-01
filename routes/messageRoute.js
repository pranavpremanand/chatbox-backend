const express = require("express");
const { getMessages, addMessage } = require("../controllers/messageController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

router.post("/",authMiddleware, addMessage);
router.get("/:chatId",authMiddleware, getMessages);

module.exports = router;

const express = require('express')
const { createChat, userChats, findChat, currentChat } = require('../controllers/chatController')
const authMiddleware = require('../middlewares/authMiddleware')
const router = express.Router()

router.post('/',authMiddleware, createChat)
router.get('/',authMiddleware,userChats)
router.get('/current-chat/:id',authMiddleware,currentChat)
router.get('/find/:firstId/:secondId',authMiddleware,findChat)

module.exports = router
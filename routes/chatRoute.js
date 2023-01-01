const express = require('express')
const { createChat, userChats, findChat } = require('../controllers/chatController')
const authMiddleware = require('../middlewares/authMiddleware')
const router = express.Router()

router.post('/',authMiddleware, createChat)
router.get('/',authMiddleware,userChats)
router.get('/find/:firstId/:secondId',authMiddleware,findChat)

module.exports = router
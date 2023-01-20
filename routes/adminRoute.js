const express = require('express')
const router = express.Router()
const {doAdminLogin, getUsers, blockUser, getReportedPosts, deletePost, ignorePost, acceptVerificationRequest} = require("../controllers/adminController")
const adminAuth = require('../middlewares/adminAuth')

// Do admin login
router.post('/login',doAdminLogin)

// Get users
router.get('/get-users',adminAuth, getUsers)

// Block or Unblock user
router.get("/block-user/:userId",adminAuth,blockUser)

// Get reported posts
router.get('/reported-posts',adminAuth,getReportedPosts)

//Delete reported post
router.get("/delete-post/:id", adminAuth,deletePost);

//Ignore reported post
router.get("/ignore-post/:id", adminAuth,ignorePost);

//Accept verification request
router.get('/accept-verification-request/:userId', adminAuth,acceptVerificationRequest)

module.exports = router
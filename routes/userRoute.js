const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const verifyJWT = require("../middlewares/verifyJWT");
const authMiddleware = require("../middlewares/userAuth");
const { checkUserBlock, checkUserStatus } = require("../middlewares/checkBlock");

//Signup
router.post("/signup", userController.doSignup);

//Send OTP
router.post("/send-otp", userController.sendOtp);

//Forgot password - send OTP
router.post('/otp-login',userController.sendLoginOtp)

//Change password
router.post("/change-password",userController.changePassword)

//Login
router.post("/login", userController.doLogin);

//Check user active status
router.get('/check-status/:userId',checkUserStatus)

//Get user data
router.get("/get-user-info-by-id", authMiddleware, userController.getUserInfo);

//Upload post
router.post("/upload-post", authMiddleware, userController.uploadPost);

//Get posts
router.get("/posts", authMiddleware, userController.getPosts);

//Delete post
router.get("/delete-post/:id", authMiddleware, userController.deletePost);

//Get users
router.get("/get-users", authMiddleware, userController.getUsersData);

//Get all users
router.get("/all-users", authMiddleware, userController.getAllUsers);

//Follow user
router.get("/follow-user/:id", authMiddleware, userController.followUser);

//Get following users
router.get("/followings",authMiddleware,userController.getFollowingUsers);

//Get followers
router.get("/followers",authMiddleware,userController.getFollowers);

//Unfollow user
router.get('/unfollow-user/:id',authMiddleware,userController.unfollowUser)

//Get other followers
router.get("/who-to-follow",authMiddleware,userController.getOtherUsers)

//Like post
router.get('/like-post/:postId',authMiddleware,userController.likePost)

//Add comment
router.post('/add-comment/:postId',authMiddleware,userController.addComment)

//Get comment
router.get('/get-comments/:postId',authMiddleware,userController.getComments)

//Delete comment
router.get("/delete-comment/:commentId/:postId",authMiddleware,userController.deleteComment)

//Get user posts
router.get("/get-user-posts/:userId",authMiddleware,userController.getUserPosts)

//Get user photos
router.get('/get-user-photos/:userId',authMiddleware,userController.getUserPhotos)

//Add cover pic
router.post("/add-cover",authMiddleware,userController.addCover)

//Add profile pic
router.post("/add-profile-pic",authMiddleware,userController.addProfilePic)

//Update profile
router.post('/update-profile',authMiddleware,userController.updateProfile)

//Get user data
router.get('/get-user/:user',authMiddleware,userController.getUser)

//Get notifications
router.get('/notifications',authMiddleware,userController.getUnseenNotifications)

//Seen notifications
router.get('/seen-notifications',authMiddleware,userController.seenNotifications)

//Search user
router.get("/search-user/:keywords",authMiddleware,userController.searchUser)

//Report post
router.post('/report-post',authMiddleware,userController.reportPost)

//Send verification request
router.get("/request-verification/:userId",authMiddleware,userController.requestVerification)

//Save or unsave post
router.get('/save-post/:postId',authMiddleware,userController.saveOrUnsavePost)

module.exports = router;

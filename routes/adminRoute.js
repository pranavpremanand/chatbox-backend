const express = require('express')
const router = express.Router()
const adminController = require("../controllers/adminController")

// Do admin login
router.post('/login',adminController.doAdminLogin)

module.exports = router
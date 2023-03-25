const express = require('express')
const router = express.Router()
const StaticController = require('./StaticController')
const {verifyToken} = require('../../util/auth')


router.post('/staticPages',verifyToken,StaticController.staticPages)

module.exports = router
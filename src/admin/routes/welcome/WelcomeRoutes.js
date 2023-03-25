const express = require('express');
const router = express.Router();
const WelcomeController = require('./WelcomeController')
const {verifyToken} = require('../../util/auth')
// const validation = require('./StaticValidation')


router.get("/firstContent",verifyToken, WelcomeController.firstContent);
router.get("/secondContent", verifyToken,  WelcomeController.secondContent);
router.get("/thirdContent", verifyToken,  WelcomeController.thirdContent);

router.post("/welcomeData/:id",verifyToken, WelcomeController.cmsdata);




module.exports = router;
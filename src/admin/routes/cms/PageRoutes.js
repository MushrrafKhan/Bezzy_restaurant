const express = require('express');
const router = express.Router();
const PageController = require('./PageController')
const {verifyToken} = require('../../util/auth')
// const validation = require('./StaticValidation')


router.get("/privacy-policy",verifyToken, PageController.privacypolicyPage);
router.get("/about-us", verifyToken,  PageController.aboutusPage);
router.get("/term-condition", verifyToken,  PageController.termAndCondition);
router.get("/faq", verifyToken,  PageController.faq);

router.post("/cmsdata/:id",verifyToken, PageController.cmsdata);




module.exports = router;
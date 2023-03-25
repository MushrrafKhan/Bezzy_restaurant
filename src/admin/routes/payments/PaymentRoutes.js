const express = require('express');
const router = express.Router();
const PaymentController = require('../payments/PaymentController');
const {verifyToken} = require('../../util/auth');


router.get('/',verifyToken,PaymentController.listPage);
router.get('/list',verifyToken,PaymentController.list);

router.get('/premium',verifyToken,PaymentController.premiumGet);
router.post('/premium',verifyToken,PaymentController.premiumPost);



module.exports = router;
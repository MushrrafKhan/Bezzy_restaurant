const express = require('express');
const router = express.Router();
const accountController = require('./accountController');
const { verifyToken } = require('../../util/auth');



router.post('/addAccount',verifyToken, accountController.addAccount)
router.get('/accountList',verifyToken, accountController.accountList)    // second screen for accounts list

router.get('/saved-acc-list',verifyToken, accountController.savedAcc)       // first screen for accounts list

router.post('/deleteAccount', verifyToken, accountController.deleteAccount)
router.post('/editAccount',verifyToken, accountController.editStaff)




router.post('/test', accountController.test)










module.exports = router
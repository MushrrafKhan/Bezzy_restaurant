const express = require('express');
const VideoController = require('../videos/VideoController');
const {verifyToken} = require('../../util/auth');
//const validations = require('./videoValidation');
//const {validate} = require('../../util/validations');
const router = express.Router();

router.get('/',verifyToken,VideoController.listPage)
router.get('/list',verifyToken,VideoController.list);
router.get('/add',verifyToken, VideoController.add);
router.get('/view/:id',verifyToken,VideoController.view);
router.post('/download',verifyToken,VideoController.downloads);
router.post('/add/save',verifyToken,VideoController.save_add);
// router.get('/delete/:id',verifyToken,VideoController.delete);
module.exports = router;
const express = require('express');
const router = express.Router();
const AdsController = require('./AdsController');
const {verifyToken} = require('../../util/auth');

const validations = require('./AdsValidations');
const {validate} = require('../../util/validations');

router.use(express.json());
router.use(express.urlencoded({extended:false}))

router.get('/',
    verifyToken,
    AdsController.listPage
);

router.get('/list/',
    verifyToken,
    AdsController.list
);
router.get('/add',verifyToken,AdsController.add)
router.post("/add/save_add", verifyToken, AdsController.addSave)

router.get('/view/:id',verifyToken,validate(validations.requireId, 'params', {}, '/users'),AdsController.view);

router.get('/edit/:id',verifyToken,AdsController.editPage);
router.post('/edit/save/:id',verifyToken,AdsController.editSave);

router.get('/update-status',
    verifyToken,
    validate(validations.updateStatus, 'query', {}, '/alerttypes'),
    AdsController.updateStatus
);

router.get('/delete/:id',
    verifyToken,
    validate(validations.requireId, 'params', {}, '/users'),
    AdsController.delete
);


module.exports = router;
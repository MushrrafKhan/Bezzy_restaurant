const express = require('express');
const router = express.Router();
const CategoryController = require('./CategoryController');
const {verifyToken} = require('../../util/auth');
const validations = require('./CategoryValidations');

const {validate} = require('../../util/validations');

router.use(express.json());
router.use(express.urlencoded({extended:false}))


router.get('/',
    verifyToken,
    CategoryController.listPage
);

router.get('/list',
    verifyToken,
    CategoryController.list
);

router.get('/add',
    verifyToken,
    CategoryController.add
);

router.post('/save',
    verifyToken,
    CategoryController.addsave
);

router.get('/edit/:id',
    verifyToken,
    CategoryController.showedit
);

router.post('/update/:id',
    verifyToken,
    CategoryController.editsave
);

router.get('/update-status',
    verifyToken,
    validate(validations.updateStatus, 'query', {}, '/Categorys'),
    CategoryController.updateStatus
);

router.get('/delete/:id',
    verifyToken,
    validate(validations.requireId, 'params', {}, '/users'),
    CategoryController.delete
);

module.exports = router;


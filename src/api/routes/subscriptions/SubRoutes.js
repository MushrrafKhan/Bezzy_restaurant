const express = require('express');
const router = express.Router();
const SubController = require('./SubController');
const { verifyToken } = require('../../util/auth');


router.get('/all-subscription',      // all subscription list
    verifyToken,
    SubController.subAll
);

router.post('/add-subscription',         // user subscription add
    verifyToken,
    SubController.saveSub
)

module.exports = router;

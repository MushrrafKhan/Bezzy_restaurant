const express = require('express');
const router = express.Router();
const RestaurantController = require('./RestaurantController');
const {verifyToken} = require('../../util/auth');
const validations = require('./RestaurantValidations'); 
const {validate} = require('../../util/validations');
router.get("/", verifyToken,RestaurantController.listPage);
router.get("/list", verifyToken,RestaurantController.list);
router.post("/datainsert",RestaurantController.Datainsert);
router.get("/view/:id", validate(validations.requireId, "params", {}, "/Restaurant"), verifyToken,RestaurantController.view);
router.get('/update-status',verifyToken,validate(validations.updateStatus22, 'query', {}, '/Restaurant'),RestaurantController.updateStatus);
router.get("/delete/:id", validate(validations.requireId, "params", {}, "/Restaurant"), verifyToken,RestaurantController.delete);
module.exports = router;
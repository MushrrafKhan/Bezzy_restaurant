const express = require('express');
const router = express.Router();
const RestaurantController = require('./RestaurantController');
const { verifyToken } = require('../../util/auth');



//----------------Restaurant API------------------------
router.post('/addRestaurant', verifyToken, RestaurantController.addRestaurant)
router.get('/getRestaurant', verifyToken, RestaurantController.getRestaurant)
router.get('/getAllRestaurant', verifyToken, RestaurantController.getAllRestaurant)             /// For second restaurant screen
router.get('/getAllRestaurantInToast', verifyToken, RestaurantController.getSavedRestaurants)     /// For first restaurant screen
router.post('/searchRestaurant', verifyToken, RestaurantController.searchRestaurant)


//-----------------Discount API------------------------
router.get('/discountGraph', verifyToken, RestaurantController.discountGraph)
router.get('/managerDiscount', verifyToken, RestaurantController.managerDiscount)
router.get('/orderDiscount', verifyToken, RestaurantController.orderDiscount)
router.get('/discounts', verifyToken, RestaurantController.discounts)
router.get('/discountHighlight', verifyToken, RestaurantController.discountHighlight)


//-----------------Events API------------------------
router.post('/addEvent', verifyToken, RestaurantController.addEvent)
router.get('/getAllEvents', verifyToken, RestaurantController.getAllEvents)
router.get('/getOneEvents', verifyToken, RestaurantController.getOneEvents)


//-----------------Order detaill API------------------------
router.get('/orderGet', verifyToken, RestaurantController.getOrder)
router.post('/searchOrder', verifyToken, RestaurantController.searchOrder)


//-----------------Threshold flag API------------------------
router.post('/threshold', verifyToken, RestaurantController.threshold)
router.get('/getThreshold', verifyToken, RestaurantController.getThreshold)


//-----------------Credit card API------------------------
router.get('/getCredit', verifyToken, RestaurantController.getCredit)


//-----------------Void API------------------------
router.get('/voidGraph', verifyToken, RestaurantController.voidGraph)
router.get('/managerVoid', verifyToken, RestaurantController.managerVoid)
router.get('/orderVoid', verifyToken, RestaurantController.orderVoid)
router.get('/voidHighlight', verifyToken, RestaurantController.voidHighlight)


//-----------------More API------------------------
router.get('/moreWeek', verifyToken, RestaurantController.moreWeek)
router.get('/moreYear', verifyToken, RestaurantController.moreYear)
router.get('/moreWeekTotal', verifyToken, RestaurantController.moreWeekTotal)
router.get('/moreYearTotal', verifyToken, RestaurantController.moreYearTotal)


router.get('/test', verifyToken, RestaurantController.test)



module.exports = router
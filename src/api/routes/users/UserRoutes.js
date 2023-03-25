const express = require('express');
const router = express.Router();
const UserController = require('./UserController');
const { verifyToken } = require('../../util/auth');


router.post('/upload-profile',
    verifyToken,
    // validate(validations.requireId, 'query'),
    UserController.uploadProfile
);

router.put('/password',
    verifyToken,
    //validate(validations.updatePassword),
    UserController.updatePassword
);

router.post('/notification',          //  turn ON/OFF notifications.
    verifyToken,
    UserController.notificationTurn
);
router.post('/media',          //  turn ON/OFF notifications.
    verifyToken,
    UserController.mediaTurn
);

router.get('/profile',                   // User Profile Get
    verifyToken,
    UserController.profile
);

router.post('/updateProfile',            // Update user profile
    verifyToken,
    UserController.updateProfile
);
router.post('/socialLogIn',UserController.socialLogIn);

router.put('/password',
    verifyToken,
    UserController.changePassword        // Update user password
);

router.post('/saveLocation',             // save location
    verifyToken,
    UserController.saveLocation
);

router.post('/location',                  // location ON/OFF
    verifyToken,
    UserController.locationTurn
)

router.get("/nearAd",                    // show ad near user
    verifyToken,
    //validate( validations.edit-profile ),
    UserController.nearAd
)

router.get('/notifications-list',       // Get notification own user
    verifyToken,
    UserController.getNotificationList
);

router.post('/deleteUser',
    verifyToken,
    UserController.deleteUser
);

router.post('/getAd',
    verifyToken,
    UserController.getAd
);
router.post('/subscriptionSave',
    verifyToken,
    UserController.subSave
);

router.get('/subscriptionGet',
    verifyToken,
    UserController.subGet
);

router.get('/welcome',
    verifyToken,
    UserController.welcome
);

router.get('/privacy-policy', 
    UserController.privacy_policyPage
);
router.get('/terms-conditions', 
    UserController.termsAndconditionPage
);
router.get('/about-us', 
    UserController.Aboutus
);
router.get('/support_center', 
    UserController.Support
);

router.get("/html_page/:slug",
    UserController.html_page
)

module.exports = router;

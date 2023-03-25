const express = require('express');
const router = express.Router();
const {validate} = require('../../util/validations');
const validations = require('./AuthValidations');
const AuthController = require('./AuthController');

router.get('/log-in',
    AuthController.logInPage
);

router.post('/log-in',
    validate(validations.logIn),
    AuthController.logIn
);

router.get('/log-out',
    AuthController.logout
);

router.get('/forgot-password',
    AuthController.forgotPasswordPage,
);

router.post('/forgot-password',
    validate(validations.forgotPassword),
    AuthController.forgotPassword
);

router.get('/resend-otp',
    AuthController.resendOTP
);

router.get('/validate-otp',
    AuthController.validateOTP
);

router.get('/reset-password',
    AuthController.resetPasswordPage
);

router.post('/reset-password',
    validate(validations.resetPassword),
    AuthController.resetPassword
);


router.get('/user-reset-password',
    AuthController.userResetPasswordPage
);

router.post(
    '/user-reset-password',
    //validate(validations.resetPassword),
    AuthController.userResetPassword
);

router.get('/privacy_policy',
   
    AuthController.privacy_policyPage
);

router.get('/terms_conditions',
   
    AuthController.termsAndconditionPage
);
router.get('/about_us',
   
    AuthController.Aboutus
);

router.get('/support_center',
    AuthController.support_center
);


module.exports = router;

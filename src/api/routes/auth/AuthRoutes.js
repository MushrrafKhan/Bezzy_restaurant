const express = require('express');
const router = express.Router();
const AuthController = require('./AuthController');

const { validate } = require('../../util/validations');
const validations = require('./AuthValidations');
const { verifyToken } = require('../../util/auth');

const {
    models: { Users },
} = require('../../../../lib/models');

router.get('/generate-token/:_id', AuthController.generateToken);

router.post('/log-in', validate(validations.logIn), AuthController.logIn);

router.post('/signup-mail', AuthController.signupMail);

router.post('/verify-otp', AuthController.verifyOtp);

router.post('/signup-mobile',verifyToken, AuthController.signupMobile);

router.post('/signup-profile', verifyToken, AuthController.signupProfile);

router.get('/log-out', verifyToken, AuthController.logOut);

router.post('/forgot-password', AuthController.forgotPassword);

router.post('/reset-password', AuthController.resetPassword);

router.post('/resend-otp', AuthController.resendOtp);

router.post('/check-validation', AuthController.checkValidation);

router.post('/change-password',verifyToken, AuthController.changePassword);

router.post('/check', AuthController.testA);

// router.post('/signup-otp', AuthController.signupOtp);
// router.get('/verify-link', AuthController.verifyLink);
// router.post('/signup-password', verifyToken, AuthController.signupPassword);

module.exports = router;
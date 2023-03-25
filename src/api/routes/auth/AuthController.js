const {
    models: { User },
} = require('../../../../lib/models');
const mailer = require('../../../../lib/mailer');
const { showDate, uploadImageLocal, uploadImage } = require('../../../../lib/util');
const sms = require('../../../../lib/sms');
const { signToken } = require('../../util/auth');
const {
    utcDateTime,
    getWeekNumber,
    generateOtp,
    logError,
    adminEmail,
    randomString,
    createS3SingnedUrl,
    generateResetToken,
    sendSms,
} = require('../../../../lib/util');
var _ = require('lodash');
const jwtToken = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const emailEnv = process.env.FROM_MAIL;
//const { compress } = require('compress-images/promise');
const multiparty = require('multiparty');
//const mailer = require('../../../../lib/mailer');
var apiEnv = process.env.NODE_ENV;
console.log('this is env:', apiEnv);
var moment = require('moment');

class AuthController {
    async logIn(req, res, next) {
        try {
            const { email, password, deviceType, deviceToken, location } = req.body;
            let user;
            let msg;

            user = await User.findOne({ email: email, isDeleted: false });

            if (!user) {
                return res.notFound('', 'Invalid email');
            }
            if (user.emailVerify == false) {
                return res.send({
                    status: 0,
                    message: req.__('There is no account associated with this email, please register.'),
                });
            }

            msg = 'Invalid email or password';

            const passwordMatched = await user.comparePassword(password);

            if (!passwordMatched) {
                return res.warn('', msg);
            }

            if (user.isSuspended) {
                return res.warn({ "userId": user._id, "emailVerified": user.emailVerify, "adminVerified": !(user.isSuspended) }, 'Admin has yet to approve verification');
            }

            //deviceId  ---> Single Value
            user.emailToken = generateResetToken(12);
            user.authTokenIssuedAt = utcDateTime().valueOf();
            user.deviceToken = deviceToken;
            user.loc = location;
            user.isLogin = true;
            user.deviceType = deviceType;
            await user.save();

            let token = user.emailToken;



            const jwttoken = signToken(user);
            const userJson = user.toJSON();

            ['password', 'authTokenIssuedAt', 'otp', 'emailToken', '__v'].forEach(key => delete userJson[key]);

            return res.success({
                language: req.headers['accept-language'],
                jwt: jwttoken,
                token: token,
                user: userJson,
            }, req.__('Login successfully'));
        } catch (err) {
            return next(err);
        }
    }

    async signupMail(req, res, next) {
        let { email, password, confirm_password, deviceToken, deviceType, location } = req.body;

        try {
            //email find if exist or not
            let checkEmailExists = await User.findOne({
                email,
            });
            if (checkEmailExists && checkEmailExists.email) {
                if (checkEmailExists.progress == 0) {
                    if (checkEmailExists.emailVerify == false) {
                        await User.deleteOne({ email: email });
                    }
                } else if (checkEmailExists.progress == 1) {
                    return res.send({
                        status: 0,
                        progress: checkEmailExists.progress,
                        message: req.__('This email id already exist'),
                    });
                } else if (checkEmailExists.progress == 3) {
                    return res.send({
                        status: 0,
                        progress: checkEmailExists.progress,
                        message: req.__('This email id already exist'),
                    });
                }
            }

            let x = await User.findOne({ email });
            if (!x) {
                // console.log('----------mai---------');
                if (password != confirm_password) {
                    return res.warn('', req.__("Password doesn't match"));
                }
                let user = new User();
                let otp = generateOtp();
                // const platform = req.headers['x-finplore-platform'];
                // const version = req.headers['x-finplore-version'];
                user.email = email;
                user.password = password;
                user.loc = location;
                // user.otp = otp;
                user.otp = 1234;
                user.authTokenIssuedAt = utcDateTime().valueOf();
                user.emailToken = generateResetToken(12);
                user.emailVerify = false;
                // user.deviceId=deviceId

                if (deviceToken) {
                    user.deviceToken = deviceToken;
                    user.deviceType = deviceType;
                }

                user = await user.save();

                let emailToSend = user.email;
                let token = user.emailToken;

                //Construct mail body here
                // var rand = Math.floor((Math.random() * 100) + 54);
                // var host = req.get('host');
                // var link = "http://"+host+"/auth/verify-link?id="+user.emailToken;
                // var link = `http://${host}/auth/verify-link?id=${user.emailToken}`
                const msg = {
                    to: emailToSend,
                    from: emailEnv, // Change to your verified sender
                    subject: 'Bezzy: Please confirm your Email account',
                    text: 'Please enter the following OTP to verify your signup : ' + otp,
                    html: '<strong>Please enter the following OTP to verify your signup :' + otp + '</strong>',
                };

                //Send Email Here
                // console.log('------mailBeforeSend------');
                if (process.env.SENDGRID_STATUS === '1') {
                    // console.log('------mailAfterSend------');
                    sgMail
                        .send(msg)
                        .then(() => {
                            console.log('Email sent');
                            // const userJson = user.toJSON();
                            // ['password', 'authTokenIssuedAt','otp','emailToken', '__v'].forEach(key => delete userJson[key]);
                            // userJson.isDefaultLocation = false;
                            return res.success(
                                {
                                    language: req.headers['accept-language'],
                                    token,
                                    emailVerified: emailToSend,
                                    // user: userJson,
                                },
                                'A confirmation code has been sent to your email.'
                            );
                        })
                        .catch(error => {
                            console.error(error);
                        });
                } else {
                    return res.success(
                        {
                            language: req.headers['accept-language'],
                            token,
                            emailVerified: emailToSend,
                            // user: userJson,
                        },
                        'A confirmation code has been sent to your email.'
                    );
                }
            } else {
                return res.send({
                    status: 0,
                    progress: checkEmailExists.progress,
                    message: req.__('This email id already exist'),
                });
            }
        } catch (err) {
            console.log(err);
            return next(err);
        }
    }

    async verifyOtp(req, res, next) {
        let { otp, email, token } = req.body;
        try {
            let user;
            user = await User.findOne({
                email,
                isDeleted: false,
            });

            if (!user) {
                return res.unauthorized(null, req.__('UNAUTHORIZED'));
            }

            if (user) {
                if (user.otp == otp) {
                    if (user.emailToken == token) {
                        user.progress = 1;
                        user.emailVerify = true;
                    } else if (user.resetToken == token) {
                        user.emailVerify = true;
                    } else {
                        return res.warn('', req.__('Token not match'));
                    }

                    let newUser = await user.save();

                    const jwttoken = signToken(user);

                    const userJson = user.toJSON();

                    return res.success(
                        {
                            _id: newUser._id,
                            emailVerified: newUser.emailVerify,
                            jwt: jwttoken,
                            token: token,
                            user: userJson,
                        },
                        req.__('OTP verified successfully')
                    );
                } else {
                    return res.warn('', req.__('Invalid OTP'));
                }
            } else {
                return res.warn('', req.__('GENERAL_ERROR'));
            }
        } catch (err) {
            console.log(err)
            return next(err);
        }
    }

    async signupMobile(req, res, next) {
        try {
            let { mobileNumber } = req.body;
            let user = await User.findOne({ _id: req.user._id });
            if (user) {
                user.mobileNumber = mobileNumber;
                user.progress = 2;
                user.save();
                const userJson = user.toJSON();

                return res.success(
                    {
                        language: req.headers['accept-language'],
                        user: userJson
                    },
                    req.__('MobileNumber created successfully')
                );
            } else {
                return res.warn('', req.__('USER_NOT_FOUND'));
            }
        } catch (err) {
            console.log(err);
            return next(err);
        }
    }

    async signupProfile(req, res, next) {
        try {
            let user = await User.findOne({ _id: req.user._id });
            if (user) {
                let form = new multiparty.Form();
                form.parse(req, async function (err, fields, files) {
                    _.forOwn(fields, (field, key) => {
                        user[key] = field[0];
                    });
                    try {
                        if (files.image !== undefined) {
                            let fileupload = files.image[0];
                            let image = await uploadImage(fileupload, 'users');
                            user.image = image.Key;
                            user.progress = 3;
                        }
                        user.progress = 3;

                        await user.save();
                        const userJson = user.toJSON();

                        return res.success(
                            {
                                language: req.headers['accept-language'],
                                user: userJson
                            },
                            req.__('Profile created successfully')
                        );
                    } catch (err) {
                        return next(err);
                    }
                });
            } else {
                return res.warn('', req.__('USER_NOT_FOUND'));
            }
        } catch (err) {
            return next(err);
        }
    }

    async logOut(req, res) {
        // console.log('===logout===')
        const { user } = req;
        user.authTokenIssuedAt = null;
        user.deviceToken = null;
        await user.save();
        return res.success('', req.__('LOGOUT_SUCCESS'));
    }

    /**
     *
     * @param {*} req
     * @param {*} res
     * @param {*} next
     * @returns
     */

    async forgotPassword(req, res, next) {
        let { email } = req.body;
        try {
            let user;

            // console.log("this is Email Address>>>>>>>",email);
            user = await User.findOne({
                email,
                isDeleted: false,
            });

            //  console.log("this is user>>>>>>>>>>>>>>",user);
            if (!user) {
                return res.warn('', req.__('EMAIL_NOT_REGISTER'));
            }

            if (user) {
                if (user.isSuspended) {
                    //account suspended
                    return res.warn('', 'Your account is not verified by admin');
                }
                //generated unique token and save in user table and send reset link
                // let emailToken = randomString(10);
                let resetToken = randomString(10);
                let otp = generateOtp();
                user.resetToken = resetToken;
                // user.emailVerify = false;
                // user.mobileVerify = false;
                // user.otp = otp;
                user.otp = 1234;
                user.authTokenIssuedAt = utcDateTime().valueOf();
                await user.save();

                // console.log(user);

                if (user.email != '') {
                    let emailToSend = user.email;

                    //console.log('--------------test------------');
                    //Construct mail body here
                    const msg = {
                        to: emailToSend,
                        from: emailEnv, // Change to your verified sender
                        subject: 'Bezzy: Forgot Password OTP',
                        text: 'Please enter the following OTP to reset your password : ' + user.otp,
                        html:
                            '<strong>Please enter the following OTP to reset your password :' + user.otp + ' </strong>',
                    };

                    //Send Email Here
                    if (process.env.SENDGRID_STATUS === '1') {
                        sgMail
                            .send(msg)
                            .then(() => {
                                console.log('Email sent');

                                return res.success(
                                    {
                                        token: resetToken
                                    },
                                    'A confirmation code has been sent to your email.'
                                );
                            })
                            .catch(error => {
                                console.error(error);
                            });
                    } else {
                        return res.success(
                            {
                                token: resetToken
                            },
                            'A confirmation code has been sent to your email.'
                        );
                    }
                }
            } else {
                //no user found
                return res.warn('', req.__('EMAIL_NOT_REGISTER'));
            }
        } catch (err) {
            return next(err);
        }
    }

    async resetPassword(req, res, next) {
        let { password, confirm_password, email, token } = req.body;
        try {
            // console.log(req.body)
            const user = await User.findOne({
                email,
                isDeleted: false,
            });

            if (!user) {
                return res.unauthorized(null, req.__('UNAUTHORIZED'));
            }
            if (user) {
                console.log(req.body)
                if (user.resetToken === token) {
                    if (password == confirm_password) {
                        user.password = password;
                        user.emailVerify = true;
                        let newUser = await user.save();

                        let emailToSend = newUser.email;
                        //Construct mail body here
                        const msg = {
                            to: emailToSend,
                            from: emailEnv, // Change to your verified sender
                            subject: 'Bezzy: Password Updated',
                            text: 'Password has been Updated',
                            html: '<strong>Password has been Updated</strong>',
                        };

                        //Send Email Here

                        if (process.env.SENDGRID_STATUS === '1') {
                            sgMail
                                .send(msg)
                                .then(() => {
                                    console.log('Email sent');

                                    return res.success(
                                        {
                                            message: 'Password has been Updated',
                                        },
                                        req.__('OTP_SEND_SUCCESS')
                                    );
                                })
                                .catch(error => {
                                    console.error(error);
                                });
                        } else {
                            return res.success(
                                {
                                },
                                'Password has been Updated'
                            );
                        }

                    } else {
                        res.send({
                            status: 0,
                            message: req.__('Password not match'),
                        });
                    }
                    return res.success('', req.__('PASSWORD_CHANGED'));
                } else {
                    return res.warn({}, req.__("resetToken not match"));
                }
            } else {
                return res.warn('', req.__('GENERAL_ERROR'));
            }
        } catch (err) {
            return next(err);
        }
    }

    async resendOtp(req, res, next) {
        let { email, token } = req.body;
        try {
            let user;
            user = await User.findOne({
                email,
                isDeleted: false,
            });

            if (!user) {
                return res.unauthorized(null, req.__('UNAUTHORIZED'));
            }
            if (user) {
                if (user.resetToken === token) {
                    let otp = generateOtp();
                    user.otp = otp;
                    let newUser = await user.save();
                    let emailToSend = newUser.email;

                    //Construct mail body here
                    const msg = {
                        to: emailToSend,
                        from: emailEnv, // Change to your verified sender
                        subject: 'Bezzy: Forgot Password OTP',
                        text: 'Please enter the following OTP to reset your password : ' + user.otp,
                        html:
                            '<strong>Please enter the following OTP to reset your password :' +
                            user.otp +
                            ' </strong>',
                    };

                    //Send Email Here
                    if (process.env.SENDGRID_STATUS === '1') {
                        sgMail
                            .send(msg)
                            .then(() => {
                                console.log('Email sent');

                                return res.success(
                                    {
                                        message: 'A confirmation code has been sent to your email.',
                                    },
                                    req.__('OTP_SEND_SUCCESS')
                                );
                            })
                            .catch(error => {
                                console.error(error);
                            });
                    } else {
                        return res.success(
                            {
                                message: 'A confirmation code has been sent to your email.',
                            },
                            req.__('OTP_SEND_SUCCESS')
                        );
                    }

                } else if (user.emailToken === token) {
                    let otp = generateOtp();
                    user.otp = otp;
                    let newUser = await user.save();
                    let emailToSend = newUser.email;

                    //Construct mail body here
                    const msg = {
                        to: emailToSend,
                        from: emailEnv, // Change to your verified sender
                        subject: 'Bezzy: Verify Email OTP',
                        text: 'Please enter the following OTP to verify your email : ' + user.otp,
                        html:
                            '<strong>Please enter the following OTP to verify your email :' +
                            user.otp +
                            ' </strong>',
                    };

                    //Send Email Here

                    if (process.env.SENDGRID_STATUS === '1') {
                        sgMail
                            .send(msg)
                            .then(() => {
                                console.log('Email sent');

                                return res.success(
                                    {
                                        message: 'A confirmation code has been sent to your email.',
                                    },
                                    req.__('OTP_SEND_SUCCESS')
                                );
                            })
                            .catch(error => {
                                console.error(error);
                            });
                    } else {
                        return res.success(
                            {
                                message: 'A confirmation code has been sent to your email.',
                            },
                            req.__('OTP_SEND_SUCCESS')
                        );
                    }

                } else {
                    return res.warn("", req.__("Invalid reset tokens"));
                }

            } else {
                return res.warn('', req.__('GENERAL_ERROR'));
            }
        } catch (err) {
            return next(err);
        }
    }

    async changePassword(req, res, next) {
        let { current_password, password, confirm_password } = req.body;
        try {
            let email = req.user.email
            const user = await User.findOne({
                email,
                isDeleted: false,
            });

            if (!user) {
                return res.unauthorized(null, req.__('UNAUTHORIZED'));
            }
            const passwordMatched = await user.comparePassword(current_password);

            if (user) {
                if (passwordMatched) {
                    if (password == confirm_password) {
                        user.password = password;
                        let newUser = await user.save();
                        let emailToSend = newUser.email;
                        return res.success({
                            emailToSend
                        }, req.__('Password has been updated'));
                    } else {
                        return res.warn('', 'New password not match');
                    }
                } else {
                    return res.warn({}, req.__("Current password not match"));
                }
            } else {
                return res.warn('', req.__('GENERAL_ERROR'));
            }
        } catch (err) {
            return next(err);
        }
    }

    async editSave(req, res, next) {
        var _id = req.params.id;
        let post = await User.findOne({ _id: req.user._id });
        let form = new multiparty.Form();
        form.parse(req, async function (err, fields, files) {
            let newImage = false;
            let fileupload = files.image[0];
            if (fileupload.size > 0) {
                newImage = true;
            }
            _.forOwn(fields, (field, key) => {
                post[key] = field[0];
            });
            try {
                if (newImage) {
                    let image = await uploadImage(fileupload, 'post');
                    post['image'] = image.Key;
                }
                await post.save();
                req.flash('success', req.__('Post updated success !'));
                return res.redirect('/posts/');
            } catch (err) {
                return next(err);
            }
        });
    }

    async addUserSave(req, res, next) {
        let user = await User.findOne({ _id: req.user._id });
        let form = new multiparty.Form();
        form.parse(req, async function (err, fields, files) {
            let fileupload = files.image[0];
            _.forOwn(fields, (field, key) => {
                user[key] = field[0];
            });
            try {
                let image = await uploadImage(fileupload, 'users');
                user['image'] = image.Key;
                await user.save();
                return res.success(JSON.parse(JSON.stringify(user)), req.__('User Profile Add'));
            } catch (err) {
                return next(err);
            }
        });
    }

    async checkValidation(req, res, next) {
        let { mobile, email } = req.body;
        //admin.emailToken = generateResetToken();
        try {
            let user = await Concierge.findOne({ mobile: mobile });
            if (user) {
                return res.warn('', req.__('MOBILE_NO_EXISTS'));
            } else {
                user = await Concierge.findOne({ email });
                if (user) {
                    return res.warn('', req.__('EMAIL_EXISTS'));
                } else {
                    return res.success('', 'Success');
                }
            }
        } catch (err) {
            console.log(err);
            return next(err);
        }
    }

    async generateToken(req, res) {
        // console.log('===generateToken===')

        let _id = req.params._id;
        const user = await User.findOne({ _id });
        // console.log(user)

        if (user) {
            // console.log('pass')
            const platform = req.headers['x-hrms-platform'];
            const token = signToken(user, platform);
            return res.success(
                {
                    token,
                },
                req.__('OTP_VERIFY_SUCCESS')
            );
            // req.__('Token generate success'));
        } else {
            // console.log('error')
            return res.warn('', req.__('User not found'));
        }
    }

    async testA(req, res, next) {
        console.log('-----')
        var request = require('request');

        // var headers = {
        //     'Toast-Restaurant-External-ID': '9eb7014a-dd0d-4d8b-9af4-4b14fd620015'
        // };

        var options = {
            url: 'https://toast-api-server/restaurants/v1/restaurants/9eb7014a-dd0d-4d8b-9af4-4b14fd620015',
            // headers: headers
        };

        function callback(error, response, body) {
            console.log(error)
            if (!error && response.statusCode == 200) {
                console.log(body);
            }
        }

        request(options, callback);
    }

    /*async signupOtp(req, res, next) {
        let { otp, email, token, deviceId, deviceToken, deviceType } = req.body;
        try {
            let user;
            user = await User.findOne({
                email,
                isDeleted: false,
            });

            if (!user) {
                return res.unauthorized(null, req.__('UNAUTHORIZED'));
            }

            if (user) {
                if (user.otp == otp) {
                    if (user.emailToken == token) {
                        //    user.emailVerify = true;
                        user.progress = 1;
                        user.deviceToken = deviceToken;
                        user.deviceType = deviceType;
                        user.deviceId.push(deviceId);
                    } else {
                        return res.warn('', req.__('emailToken not match'));
                    }

                    let newUser = await user.save();

                    const jwttoken = signToken(user);

                    const userJson = user.toJSON();

                    userJson.jwttoken = jwttoken;

                    return res.success(
                        {
                            _id: newUser._id,
                            emailVerified: newUser.emailVerify,
                            token: token,
                            user: userJson,
                        },
                        req.__('OTP_VERIFY_SUCCESS')
                    );
                } else {
                    return res.warn('', req.__('INVALID_OTP'));
                }
            } else {
                return res.warn('', req.__('GENERAL_ERROR'));
            }
        } catch (err) {
            return next(err);
        }
    }*/

    /*async verifyLink(req, res, next) {
        // let {otp, email, token} = req.body;
        // console.log(req.params.id+"========")
        // console.log(req.query.id+"========")

        try {
            let user;
            user = await User.findOne({ emailToken: req.query.id, emailVerify: false });

            if (!user) {
                // console.log('user not')
                return res.unauthorized(null, req.__('UNAUTHORIZED'));
            }

            if (user) {
                // console.log('user verify')
                if (user.emailToken == req.query.id) {
                    user.emailVerify = 'true';
                }

                let newUser = await user.save();
                const jwttoken = signToken(user);
                const userJson = user.toJSON();
                //console.log(newUser);

                return res.success(
                    {
                        _id: newUser._id,
                        emailVerified: newUser.emailVerify,
                        jwt: jwttoken,
                        user: userJson,
                    },
                    'Link Verify Success'
                );
            } else {
                return res.warn('', req.__('GENERAL_ERROR'));
            }
        } catch (err) {
            return next(err);
        }
    }*/

    /*async signupPassword(req, res, next) {
        try {
            let id = req.user._id;
            let { password, confirm_password } = req.body;
            // console.log('========='+email,password, confirm_password)
            let user = await User.findOne({ _id: id });

            if (user) {
                // console.log('====='+user+'======')
                if (password != confirm_password) {
                    return res.warn('', req.__('password not match'));
                } else {
                    user.password = password;
                    user.progress = 3;
                    user.emailVerify = true;

                    await user.save();
                    return res.success(
                        {
                            language: req.headers['accept-language'],
                        },
                        req.__('Password created successfully')
                    );
                }
            } else {
                return res.warn('', req.__('User not found'));
            }
        } catch (err) {
            return next(err);
        }
    }*/
}

module.exports = new AuthController();

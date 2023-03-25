const {
    models: { Admin, User, Ads,Category,Page },
} = require('../../../../lib/models');
const { generateResetToken, logError } = require('../../../../lib/util');
const mailer = require('../../../../lib/mailer');
const sms = require('../../../../lib/sms');

const { signToken } = require('../../util/auth');
const { utcDateTime } = require('../../../../lib/util');

class AuthController {
    async logInPage(req, res) {
        if (req.session.user) {
            return res.redirect('/');
        }
        return res.render('login');
    }

    async logIn(req, res) {
        if (req.session.user) {
            return res.redirect('/');
        }
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email, isDeleted: false });
        if (!admin) {
            req.flash('error', req.__('INVALID_CREDENTIALS'));
            return res.redirect('/auth/log-in');
        }
        if (admin.isSuspended) {
            req.flash('error', req.__('YOUR_ACCOUNT_SUSPENDED'));
            return res.redirect('/auth/log-in');
        }
        
        const passwordMatched = await admin.comparePassword(password);
        if (!passwordMatched) {
            req.flash('error', req.__('INVALID_CREDENTIALS'));
            return res.redirect('/auth/log-in');
        }

        admin.authTokenIssuedAt = utcDateTime().valueOf();
        await admin.save();

        const adminJson = admin.toJSON();
        const token = signToken(admin);

        ['password', 'authTokenIssuedAt', '__v'].forEach(key => delete adminJson[key]);

        req.session.user = adminJson;
        req.session.token = token;
        req.flash('success', req.__('LOGIN_SUCCESS'));
        return res.redirect('/');
    }

    async logout(req, res) {
        req.session.user = null;
        req.session.token = null;
        req.flash('success', req.__('LOGOUT_SUCCESS'));
        return res.redirect('/auth/log-in');
    }

    async dashbaord(req, res) {

        const user_count = await User.countDocuments({'isDeleted':false});
        const Total_alerts=await Ads.count();
        const Categorys=await Category.count();
        let new_users = await User.find({
            isDeleted: false
        })
        .sort({created: 'desc'})
        .limit(5)
        .lean();

        return res.render('index', {
            user_count,
            Total_alerts,
            Categorys,
            new_users
        });
    }

    async profilePage(req, res) {
        const { user } = req;
        return res.render('profile', {
            user,
        });
    }
    async profile(req, res) {
        const { user } = req;
        const { firstName, lastName, email, contactNumber } = req.body;

        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;
        user.contactNumber = contactNumber;
        await user.save();

        req.flash('success', req.__('PROFILE_UPDATED'));
        return res.redirect('/profile');
    }

    async changePasswordPage(req, res) {
        return res.render('change-password');
    }

    async changePassword(req, res) {
        const { user } = req;
        const { currentPassword, newPassword } = req.body;

        const passwordMatched = await user.comparePassword(currentPassword);
        if (!passwordMatched) {
            req.flash('error', req.__('PASSWORD_MATCH_FAILURE'));
            return res.redirect('/change-password');
        }

        user.password = newPassword;
        await user.save();

        req.flash('success', req.__('PASSWORD_CHANGED'));
        return res.redirect('/change-password');
    }

    async forgotPasswordPage(req, res) {
        if (req.session.user) {
            return res.redirect('/');
        }
        return res.render('forgot-password');
    }

    async forgotPassword(req, res) {
        if (req.session.user) {
            return res.redirect('/');
        }
        const { email } = req.body;

        const admin = await Admin.findOne({
            email,
            isDeleted: false,
        });

        if (!admin) {
            req.flash('error', req.__('USER_NOT_FOUND'));
            return res.redirect('/auth/forgot-password');
        }

        if (admin.isSuspended) {
            req.flash('error', req.__('YOUR_ACCOUNT_SUSPENDED'));
            return res.redirect('/auth/forgot-password');
        }

        admin.resetToken = generateResetToken();
        await admin.save();

        req.flash('success', req.__('FORGOT_PASSWORD_MAIL_SUCCESS'));
        res.redirect('/auth/reset-password?email='+email);
        
        sms.sendSMS(admin.contactNumber, admin.resetToken + ' is the OTP to complete your forgot password step. Please do not share with anyone.')
  

        mailer
            .sendMail('admin-forgot-password', req.__('EMAIL_RESET_PASSWORD'), email, {
                verification_code: admin.resetToken,
                resetLink: `${process.env.SITE_URL}/auth/reset-password?email=${email}`,
            })
            .catch(error => {
                logError(`Failed to send password reset link to ${email}`);
                logError(error);
            });
    }

    async resendOTP(req, res) {
        if (req.session.user) {
            return res.redirect('/');
        }
        
        const { email } = req.query;

        const admin = await Admin.findOne({
            email,
            isDeleted: false,
        });

        if (!admin) {
            req.flash('error', req.__('USER_NOT_FOUND'));
            return res.redirect('/auth/forgot-password');
        }

        if (admin.isSuspended) {
            req.flash('error', req.__('YOUR_ACCOUNT_SUSPENDED'));
            return res.redirect('/auth/forgot-password');
        }

        admin.resetToken = generateResetToken();
        await admin.save();

        req.flash('success', req.__('FORGOT_PASSWORD_MAIL_SUCCESS'));
        res.redirect('/auth/reset-password?email='+email);
       

        mailer
            .sendMail('admin-forgot-password', req.__('EMAIL_RESET_PASSWORD'), email, {
                verification_code: admin.resetToken,
                resetLink: `${process.env.SITE_URL}/auth/reset-password?email=${email}`,
            })
            .catch(error => {
                logError(`Failed to send password reset link to ${email}`);
                logError(error);
            });
    }

    async validateOTP(req, res){
        const { email, otp } = req.query;
        const admin = await Admin.findOne({
            email,
            isDeleted: false,
        });
        if(admin.resetToken == otp){
            return res.success(true);
        }else{
            return res.success(false);
        }
    }

    async resetPasswordPage(req, res) {
        if (req.session.user) {
            return res.redirect('/');
        }
        const { email } = req.query;

        if (!email) {
            req.flash('error', req.__('INVALID_RESET_PASS_REQUEST'));
            return res.redirect('/auth/forgot-password');
        }

        const admin = await Admin.findOne({
            email,
            isDeleted: false,
        });

        console.log(admin);
        
        if (!admin || !admin.resetToken) {
            req.flash('error', req.__('INVALID_RESET_PASS_REQUEST'));
            return res.redirect('/auth/forgot-password');
        }

        if (admin.isSuspended) {
            req.flash('error', req.__('YOUR_ACCOUNT_SUSPENDED'));
            return res.redirect('/auth/forgot-password');
        }

        return res.render('reset-password',{email});
    }

    async resetPassword(req, res) {
        if (req.session.user) {
            return res.redirect('/');
        }
        const { email } = req.query;
        const { otp, newPassword } = req.body;

        if (!email) {
            req.flash('error', req.__('INVALID_RESET_PASS_REQUEST'));
            return res.redirect('/auth/forgot-password');
        }

        const admin = await Admin.findOne({
            email,
            isDeleted: false
        });

        if (!admin) {
            req.flash('error', req.__('USER_NOT_FOUND'));
            return res.redirect('/auth/forgot-password');
        }

        if (admin.isSuspended) {
            req.flash('error', req.__('YOUR_ACCOUNT_SUSPENDED'));
            return res.redirect('/auth/forgot-password');
        }

        if (!(admin.resetToken === otp)) {
            req.flash('error', req.__('INVALID_OTP'));
            return res.redirect(req.headers['referer']);
        }

        admin.password = newPassword;
        admin.resetToken = null;
        await admin.save();

        req.flash('success', req.__('PASSWORD_CHANGED'));
        return res.redirect('/auth/log-in');
    }

    async isEmailExists(req, res) {
        const { email, id } = req.body;
        const matchCond = {
            isDeleted: false,
            email: new RegExp(`^${email}$`,'i'),
        };
        id &&
        (matchCond._id = {
            $ne: id,
        });
        const count = await Admin.countDocuments(matchCond);

        return res.send(count === 0);
    }

    async counts(req, res) {

    }


    async userResetPasswordPage(req, res) {
        
        const { resetToken } = req.query;

        if (!resetToken) {
            req.flash('error', req.__('INVALID_RESET_PASS_REQUEST'));
            return res.redirect(req.headers.referer);
        }

        const admin = await Admin.findOne({
            resetToken,
            isDeleted: false,
        });

        if (!admin || !admin.resetToken) {
            req.flash('error', req.__('INVALID_RESET_PASS_REQUEST'));
            return res.redirect(req.headers.referer);
        }

        if (admin.isSuspended) {
            req.flash('error', req.__('YOUR_ACCOUNT_SUSPENDED'));
            return res.redirect(req.headers.referer);
        }

        return res.render('user-reset-password');    }

    async userResetPassword(req, res) {
        if (req.session.user) {
            return res.redirect('/');
        }
        const { email } = req.query;
        const { otp, newPassword } = req.body;

        if (!email) {
            req.flash('error', req.__('INVALID_RESET_PASS_REQUEST'));
            return res.redirect('/auth/forgot-password');
        }

        const admin = await Admin.findOne({
            email,
            isDeleted: false
        });

        if (!admin) {
            req.flash('error', req.__('USER_NOT_FOUND'));
            return res.redirect('/auth/forgot-password');
        }

        if (admin.isSuspended) {
            req.flash('error', req.__('YOUR_ACCOUNT_SUSPENDED'));
            return res.redirect('/auth/forgot-password');
        }

        if (!(admin.resetToken === otp)) {
            req.flash('error', req.__('INVALID_OTP'));
            return res.redirect(req.headers['referer']);
        }

        admin.password = newPassword;
        admin.resetToken = null;
        await admin.save();

        req.flash('success', req.__('PASSWORD_CHANGED'));
        return res.redirect(req.headers.referer);
    }

    async vendorEmailChk(req, res) {
       

        return res.send(count === 0);
    }

    async privacy_policyPage(req, res) {
        let cms = await Page.findOne({slug:"privacy-policy"});
        console.log('============'+cms+"============")
         const content =cms.description
        const name = cms.title;
        const id = cms._id;
        res.render('openstatic',{name,content,id} );
    }

    async termsAndconditionPage(req, res) {
        let cms = await Page.findOne({slug:"terms-conditions"});
        const content =cms.description
        const name = cms.title;
        const id = cms._id;
        res.render('openstatic',{name,content,id} );
    }
    async Aboutus(req, res) {
        let cms = await Page.findOne({slug:"about-us"});
        const content =cms.description
        const name = cms.title;
        const id = cms._id;
        res.render('openstatic',{name,content,id} );
    }
    async support_center(req, res) {
        let cms = await Page.findOne({slug:"support_center"});
         const content =cms.description
        const name = cms.title;
        const id = cms._id;
        res.render('support_center',{name,content,id} );
    }
}

module.exports = new AuthController();

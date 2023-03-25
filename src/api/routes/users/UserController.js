const {
    models: { User, UserSubscription, Page, Welcome, Restaurant, Notification, Ads }
} = require('../../../../lib/models');
const { verifyToken,signToken } = require('../../util/auth');

const {
    utcDateTime,
    generateOtp,
    generateCode,
    logError,
    randomString,
    generateResetToken,
    sendSms,
} = require("../../../../lib/util");
const geolocation = require('geolocation-utils')
const moment = require('moment');
const fs = require('fs');
const multer = require('multer');
//const Math = require('mathjs');
var FCM = require('fcm-node');
const async = require("async"); ``

var serverKey = 'AAAAzZA4sMk:APA91bGohanC9uCg8Vhl3qcvdqCfpBSWb6fC6ImcPc1frmWqj1Q8XusEQqbZVlQcQ9vGNfSNjpKIssicfIPdlG-6eutICnvH-vIOzgtmr3Xw_v8cai9OAEoYywr_lCUnGYYWlrGIFtKh'; //New Client
var fcm = new FCM(serverKey);
const multiparty = require('multiparty');

//const {  generateOtp } = require('../../../../lib/util');
const { uploadImageBase64, uploadImageAPI, uploadImage } = require('../../../../lib/util');
var _ = require('lodash');
class UserController {


    async notificationTurn(req, res, next) {
        try {
            console.log('-----------------Notification Turn--------')
            let notification = req.body.notification
            let id = req.user._id
            let user = await User.findOne({
                _id: id,
                isDeleted: false,
            })
            if (user) {
                if (notification == true) {
                    user.notification = notification
                    let detail = await user.save()
                    return res.success(detail, 'Notification on successfully');
                }
                else if (notification == false) {
                    user.notification = notification
                    let detail = await user.save()
                    return res.success(detail, 'Notification off successfully');
                } else {
                    return res.warn('', 'Notification error');
                }
            } else {
                res.warn('', 'User not found')
            }
        } catch (err) {
            return next(err)
        }
    }

    async mediaTurn(req, res, next) {
        try {
            let media = req.body.media
            let id = req.user._id
            let user = await User.findOne({
                _id: id,
                isDeleted: false,
            })
            if (user) {
                if (media == true) {
                    user.media = media
                    let detail = await user.save()
                    return res.success(detail, 'Media on successfully');
                }
                else if (media == false) {
                    user.media = media
                    let detail = await user.save()
                    return res.success(detail, 'Media off successfully');
                } else {
                    return res.warn('', 'Media error');
                }
            } else {
                res.warn('', 'User not found')
            }
        } catch (err) {
            return next(err)
        }
    }

    async nearAd(req, res, next) {
        try {
            let user = req.user;
            // console.log(user)
            var Ulat = user.loc.coordinates[0]
            var Ulong = user.loc.coordinates[1]

            let ads = await Ads.find({ isDeleted: false, status: true });
            // console.log(ads)

            let distance = []
            // console.log(distance.length+"<<<<<<<<<")

            async.mapSeries(
                ads,
                async function (data) {
                    var Alat = data.loc.coordinates[0]
                    var Along = data.loc.coordinates[1]
                    let dis = geolocation.distanceTo({ lat: Ulat, lon: Ulong }, { lat: Alat, lon: Along })
                    let diss = dis / 1609.34;

                    if (diss <= data.radius) {
                        // console.log("Near User")
                        distance.push(data)
                        // console.log("=="+distance+"==")
                    }
                },

                async function () {
                    let defaultAdd = await Ads.find({ setDefault: true, isDeleted: false, status: true }).limit(1)
                    // console.log(defaultAdd.length)
                    if (distance.length == 0) {
                        res.success({ defaultAdd }, "Send default add by admin")
                    } else {
                        res.success(distance[0], "Near add find successfully")
                    }
                }
            )
        } catch (err) {
            return next(err)
        }
    }


    async updatePassword(req, res) {
        const { user } = req;
        const { currentPassword, newPassword } = req.body;

        const matched = await user.comparePassword(currentPassword);
        if (!matched) {
            return res.warn('', req.__('PASSWORD_MATCH_FAILURE'));
        }
        const matcheAddedPassword = await user.comparePassword(newPassword);
        if (matcheAddedPassword) {
            return res.warn('', 'Old password and new passowrd can not be same');
        }


        user.password = newPassword;
        await user.save();

        return res.success('', 'Password updated successfully.');
    }

    async saveLocation(req, res, next) {
        try {
            console.log('-----------------Save Location--------')
            let location = req.body.coordinates;

            let user = await User.findOne({ _id: req.user._id });

            if (!user) {
                return res.notFound('', 'Invalid email or password');
            } else {
                user.loc.coordinates = location;
                await user.save();
                return res.success({
                    user
                }, req.__('Location saved successfully'));
            }
        } catch (err) {
            return next(err)
        }
    }

    async locationTurn(req, res, next) {
        try {
            console.log('-----------------Location Turn--------')
            let location = req.body.location
            let id = req.user._id

            let user = await User.findOne({ _id: id, isDeleted: false })
            if (user) {
                if (location == true) {
                    user.location = location
                    let users = await user.save()
                    return res.success({
                        users
                    }, req.__('location on successfully'));
                } else if (location == false) {
                    user.location = location
                    let users = await user.save()
                    return res.success({
                        users
                    }, req.__('location off successfully'));
                } else {
                    return res.warn('', 'location error');
                }

            } else {
                res.warn('', 'User not found')
            }
        } catch (err) {
            return next(err)
        }
    }


    async setCurrentAddress(req, res, next) {
        try {
            let {
                address_id
            } = req.body;
            await setDefaultLocationFalse(req.user._id);

            await User.updateOne(
                {
                    _id: req.user._id, "address._id": address_id
                }, {
                $set: { "address.$.isDefault": true }
            }
            )
            return res.success('', req.__('SUCCESS'));

        } catch (err) {
            return next(err)
        }
    }

    async profile(req, res) {
        let {
            email
        } = req.body;
        let id = req.user._id;
        console.log('-----------------Profile get--------')
        let user = await User.findOne({ _id: id });
        let dbRestaurant = await Restaurant.find({ userId: id, isDeleted: false });
        let totalRestaurant = dbRestaurant.length;
        // console.log('---restauarean',dbRestaurant,'------')
        let userInformation = {};

        if (!user) {
            return res.notFound('', req.__('INVALID_REQUEST'));
        }
        else {
            userInformation["name"] = user.name;
            userInformation["position"] = user.position;
            userInformation["email"] = user.email;
            userInformation["image"] = user.image;

        }

        return res.success({ userInformation, totalRestaurant }, req.__('Profile_Information'));

    }

    async uploadProfile(req, res, next) {
        let {
            profileImage, imageName
        } = req.body;
        let user = await User.findOne({ _id: req.user._id });
        try {
            //const buf = new Buffer.from(profileImage.replace(/^data:image\/\w+;base64,/, ""), 'base64');
            //const type = profileImage.split(';')[0].split('/')[1];
            var profileImagename = imageName;
            //let fileupload = category['newImage'];
            var imagename = `profile/${Date.now() + imageName}`;
            let image = await uploadImageBase64(profileImage, imagename);
            //  let x = await getS3SingnedUrl(imagename);
            //console.log("this is image url",image);

            //var imagename = `profile/it`;
            // fs.writeFileSync('src/api/static/users/'+profileImagename, buf, 'base64', function(err) {
            //console.log(err);

            // });
            let userImageUrl = process.env.AWS_S3_BASE + imagename;
            // console.log('imagename===============', imagename);
            user.avatar = imagename;
            await user.save();
            return res.success({ imageUrl: userImageUrl }, req.__('IMAGE_SUCCESS'));
        } catch (err) {
            console.log(err);
            return next(err)
        }

    }

    async changePassword(req, res) {
        console.log('-----------------Change password--------')
        const { user } = req;
        const { currentPassword, newPassword } = req.body;

        const matched = await user.comparePassword(currentPassword);
        if (!matched) {
            return res.warn('', req.__('PASSWORD_MATCH_FAILURE'));
        }
        const matcheAddedPassword = await user.comparePassword(newPassword);
        if (matcheAddedPassword) {
            return res.warn('', 'Old password and new passowrd can not be same');
        }

        user.password = newPassword;
        await user.save();

        return res.success('', 'Password updated successfully.');
    }


    async updateProfile(req, res, next) {
        try {
            console.log('-----------------Update Profile--------')
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
                        }
                        await user.save();
                        const userJson = user.toJSON();

                        return res.success(
                            {
                                language: req.headers['accept-language'],
                                user: userJson
                            },
                            req.__('Profile updated successfully')
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

    /**
     * Function to send notification to all users when new alert created
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @returns 
     * @author Naveen
     */


    async getNotificationList(req, res, next) {
        console.log('-----------------Notification List--------')
        try {
            let id = req.user._id;
            // console.log(id)
            id.toString()
            let notifications = await Notification.find({ userId: id });
            // console.log(notifications)
            if (notifications.length == 0) {
                return res.success({
                    notifications
                }, req.__('Notifications are not available'));

            } else if (notifications.length) {
                return res.success({
                    notifications
                }, req.__('Notifications are fetch successfully'));
            } else {
                return res.warn('', 'Notifications error');

            }


        } catch (err) {
            return next(err)
        }
    }


    async deleteUser(req, res, next) {
        console.log('-----------------Delete User--------')
        let _id = req.user._id
        // let User = await User.findOne({ _id:_id})
        // if (!user) {
        //     return res.notFound('', req.__('INVALID_REQUEST'));
        // }else{}

        User.findOneAndRemove({ _id: _id })
            .then((user) => {
                // console.log(user)
                if (!user) {
                    // res.status(400).send( ' was not found');
                    return res.warn('', req.__('User not found'));
                } else {
                    res.status(200).send({
                        success: true,
                        message: ' User Deleted Successfully'
                    });
                }
            })
    }

    async getAd(req, res, next) {
        let { miles, lat, lng } = req.body;
        try {
            // let miles = 10;
            let user = await User.findOne({ _id: req.user._id })
            let userCoordinates = [];
            userCoordinates.push(lat);
            userCoordinates.push(lng);

            var milesToRadian = function (miles) {
                var earthRadiusInMiles = 3959;
                return miles / earthRadiusInMiles;
            };

            var query = {
                'loc.coordinates': {
                    $geoWithin: {
                        $centerSphere: [userCoordinates, milesToRadian(miles)],
                    },
                },


            };
            let rAd = await Ads.find(query);
            let allAd = await Ads.find();
            // console.log("allAd", allAd)
            // console.log(Math.random()*10)
            if (rAd <= 0) {
                return res.send({
                    status: 1,
                    message: "random ad fetch successfully",
                    data: allAd[0]
                });
            } else {
                return res.send({
                    status: 1,
                    message: "ad fetch successfully",
                    data: rAd
                })

            }

        } catch (error) {
            console.log(error)
            return next(error)
        }

    }

    async subSave(req, res, next) {
        try {
            let { subscriptionName, subscriptionId, subscriptionPrice, subscriptionDuration } = req.body;
            // console.log('-------subsadd----------')
            let user = req.user._id
            let user_ = await User.findOne({ _id: user })

            user_.isSubscribed = true
            await user_.save()
            let sub = await UserSubscription.findOne({ user })
            if (sub) {
                sub.subscriptionName = subscriptionName
                sub.subscriptionId = subscriptionId
                sub.subscriptionPrice = subscriptionPrice
                sub.subscriptionDuration = subscriptionDuration

                let subList = await sub.save();
                return res.success({
                    subscriptionDetail: subList
                }, req.__('Subscription update successfully'));
            } else {
                let sub_ = new UserSubscription()
                sub_.subscriptionName = subscriptionName
                sub_.subscriptionId = subscriptionId
                sub_.subscriptionPrice = subscriptionPrice
                sub_.subscriptionDuration = subscriptionDuration
                sub_.user = user
                let subList = await sub_.save();

                return res.success({
                    subscriptionDetail: subList
                }, req.__('Subscription save successfully'));
            }
        } catch (error) {
            console.log(error)
            return next(error)
        }

    }

    async subGet(req, res, next) {
        let { miles, lat, lng } = req.body;
        try {
            // let miles = 10;
            let user = await User.findOne({ _id: req.user._id })
            let userCoordinates = [];
            userCoordinates.push(lat);
            userCoordinates.push(lng);

            var milesToRadian = function (miles) {
                var earthRadiusInMiles = 3959;
                return miles / earthRadiusInMiles;
            };

            var query = {
                'loc.coordinates': {
                    $geoWithin: {
                        $centerSphere: [userCoordinates, milesToRadian(miles)],
                    },
                },


            };
            let rAd = await Ads.find(query);
            let allAd = await Ads.find();
            // console.log("allAd", allAd)
            // console.log(Math.random()*10)
            if (rAd <= 0) {
                return res.send({
                    status: 1,
                    message: "random ad fetch successfully",
                    data: allAd[0]
                });
            } else {
                return res.send({
                    status: 1,
                    message: "ad fetch successfully",
                    data: rAd
                })

            }

        } catch (error) {
            console.log(error)
            return next(error)
        }

    }

    async welcome(req, res, next) {
        try {
            // let id = req.user._id;
            let content = await Welcome.find()
            if (!content) {
                return res.notFound('', req.__('Content not found'));
            }

            // console.log(subs)
            return res.success(content, 'Welcome content find successfully.')
        } catch (err) {
            console.log(err);
            return next(err)
        }
    }

    async privacy_policyPage(req, res) {
        console.log('-----------------Privacy Policy--------')
        res.render('privacy');
    }
    async Aboutus(req, res) {
        console.log('-----------------About Us--------')
        res.render('about_us');
    }
    async termsAndconditionPage(req, res) {
        console.log('-----------------Terms And Conditions--------')
        res.render('terms_conditions');
    }

    async Support(req, res) {
        console.log('-----------------Support center--------')
        res.render('support');
    }

    async socialLogIn(req, res, next) {
        try {
            console.log('---------social Login-----------')
            const {
                email,
                socialType,
                socialId,
                deviceType,
                deviceId,
                deviceToken,
                location
            } = req.body;

            let user = await User.findOne({ email, isDeleted: false });

            if (!user) {
                // console.log("-------------new user-----signup--------")
                user = new User();
                user.email = email;
                user.emailVerify = true;
                user.authTokenIssuedAt = utcDateTime().valueOf();
                user.socialType = socialType;
                user.socialId = socialId;
                user.loc = location;
                if (deviceType) {
                    user.deviceType = deviceType
                }
                if (deviceId) {
                    user.deviceId.push(deviceId);
                }
                if (deviceToken) {
                    user.deviceToken = deviceToken
                }
                let savedUser = await user.save();
                let jwt = signToken(savedUser);
                let userJson = savedUser.toJSON();
                ["authTokenIssuedAt", "emailToken", "__v",].forEach((key) => delete userJson[key]);
                return res.success({ jwt, user: userJson, newUser: true }, "Logged In");
            }
            else {
                user.authTokenIssuedAt = utcDateTime().valueOf();
                user.emailVerify = true;
                user.isLogin = true;
                user.loc = location;
                user.deviceToken = deviceToken;
                user.deviceType = deviceType;
                user.deviceId.push(deviceId);
                user.socialType = socialType;
                user.socialId = socialId;
                let savedUser = await user.save();
                const jwt = signToken(savedUser);
                const userJson = user.toJSON();
                ["password", "authTokenIssuedAt", "otp", "emailToken", "__v"].forEach(
                    (key) => delete userJson[key]
                );
                return res.success({ jwt, user: userJson, newUser: false }, "Logged In");
            }
        } catch (err) {
            console.log(err)
            return next(err);
        }
    } 


    async html_page(req, res) {
        const termspage = req.params.slug;
        const p = await Page.findOne({ slug: termspage });
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.send(p);
    }


}

async function setDefaultLocationFalse(_id) {
    return await User.updateOne(
        {
            _id, "address.isDefault": true
        }, {
        $set: { "address.$.isDefault": false }
    }
    )
}
// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180
}


module.exports = new UserController();

const {
    models: { User, Restaurant, Notification, Events, Threshold },
} = require('../../../../lib/models');
let multiparty = require('multiparty');
let _ = require('lodash');
let moment = require('moment');
let request = require('request');
var CronJob = require('cron').CronJob;
const { showDate, uploadImageLocal, uploadImage } = require('../../../../lib/util');
var FCM = require('fcm-node');
var serverKey = process.env.SERVER_KEY; //put your server key here
var fcm = new FCM(serverKey);
const pdf = require('pdf-creator-node');
const fs = require('fs');
const path = require('path');
var html = fs.readFileSync(path.join(__dirname, './template.html'), 'utf8');
// var html = fs.readFileSync(path.join('./template.html'), 'utf8');
var CLIENT_ID = process.env.CLIENT_ID;
var CLIENT_SECRET = process.env.CLIENT_SECRET;
var USER_ACCESS_TYPE = process.env.USER_ACCESS_TYPE;
var filename = `james.pdf`;
var yearOrderDetail = require('../../../../lib/util/yearOrderDetail')
var weekOrderDetail = require('../../../../lib/util/weekOrderDetail')
class RestaurantController {

    // -----------------------------------------------------------RESTAURANT API-----------------------------------------------------------------------------
    async addRestaurant(req, res, next) {
        try {
            console.log('----------------- Add Restaurant-----')
            let {restaurantGuid, managementGroupGuid, restaurantName, locationName, createdByEmailAddress, modifiedDate, createdDate, isoModifiedDate, isoCreatedDate} = req.body
            let id = req.user._id;
            console.log(req.body)
            let user = await User.findOne({ _id: id, isDeleted: false });

            if (!user) {
                return res.warn('', 'User not found');
            } else {
                // let form = new multiparty.Form();
                const restaurant = new Restaurant({
                    userId:id,
                    restaurantGuid:restaurantGuid,
                    managementGroupGuid:managementGroupGuid,
                    restaurantName:restaurantName,
                    locationName:locationName,
                    createdByEmailAddress:createdByEmailAddress,
                    modifiedDate:modifiedDate,
                    createdDate:createdDate,
                    isoModifiedDate:isoModifiedDate,
                    isoCreatedDate:isoCreatedDate
                });
                // restaurant.name = ghj
                let saveResta = await restaurant.save();
                return res.success(
                    {
                        saveResta,
                    },
                    req.__('Restaurant created successfully')
                );
                // form.parse(req, async function (err, fields, files) {
                //     _.forOwn(fields, (field, key) => {
                //         restaurant[key] = field[0];
                //     });
                //     if (Object.keys(files).length === 0) {
                //         return res.warn('', 'please select an image');
                //     } else {
                //         let fileupload = files.image[0];
                //         let image1 = await uploadImage(fileupload, 'restaurantUser');
                //         restaurant['image'] = image1.key;
                //         restaurant['userId'] = id;
                //         let saveResta = await restaurant.save();
                //         return res.success(
                //             {
                //                 saveResta,
                //             },
                //             req.__('Restaurant created successfully')
                //         );
                //     }
                // })
            }
        } catch (err) {
            console.log(err)
            return next(err)
        }
    }
    async getAllRestaurant(req, res, next) {
        try {
            console.log('-----------------Get All Restaurant-----')
            let id = req.user._id;
            let user = User.findOne({ _id: id, isDeleted: false });
            if (!user) {
                return res.warn('', 'User not found');
            }

            var generateAuthToken = {
                method: 'POST',
                url: 'https://ws-sandbox-api.eng.toasttab.com/authentication/v1/authentication/login',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "clientId": CLIENT_ID,
                    "clientSecret": CLIENT_SECRET,
                    "userAccessType": USER_ACCESS_TYPE
                }),
            };

            function doRequest(options) {
                return new Promise(function (resolve, reject) {
                    request(options, function (error, res, body) {
                        if (!error && res.statusCode === 200) {
                            resolve(body);
                        } else {
                            reject(error);
                        }
                    });
                });
            }

            let TOKEN_DATA = await doRequest(generateAuthToken);
            let TOKEN = JSON.parse(TOKEN_DATA).token.accessToken;

            // console.log("Token=====> ", TOKEN);

            var toastRestaurant = {
                method: 'GET',
                url: 'https://ws-sandbox-api.eng.toasttab.com/partners/v1/restaurants',
                headers: {
                    Authorization: `Bearer ${TOKEN}`,
                },
            };

            function doReqForRest(_options) {
                return new Promise(function (resolve, reject) {
                    request(_options, function (error, res, body) {
                        if (!error && res.statusCode === 200) {
                            resolve(body);
                        } else {
                            reject(error);
                        }
                    });
                });
            }

            let toastData = await doReqForRest(toastRestaurant);
            let RestaurantData_ = JSON.parse(toastData);
            let dbRestaurant = await Restaurant.find({ userId: id, isDeleted: false });

            let idRestaurants = [];      /// saved restaurant in db
            dbRestaurant.map(async function (rsId) {
                idRestaurants.push(rsId.restaurantGuid);
            });

            let noAddRestaurant = [];       /// not saved restaurant in db only get from toast
            RestaurantData_.map(r => {
                if (idRestaurants.includes(r.restaurantGuid)) {
                } else {
                    noAddRestaurant.push(r);
                }
            });

            let totalRestaurant = noAddRestaurant.length;
            if (noAddRestaurant == '') {
                return res.success(
                    {
                        noAddRestaurant,
                        totalRestaurant,
                    },
                    req.__('Not restaurant found')
                );
            } else {
                return res.success(
                    {
                        noAddRestaurant,
                        totalRestaurant,
                    },
                    req.__('All restaurants in toast fetched successfully')
                );
            }
        } catch (err) {
            return next(err);
        }
    }
    async getSavedRestaurants(req, res, next) {
        try {
            console.log('-----------------Get All Saved Restaurant-----')

            let id = req.user._id;
            let user = User.findOne({ _id: id, isDeleted: false });
            if (!user) {
                return res.warn('', 'User not found');
            }
            let dbRestaurant = await Restaurant.find({ userId: id, isDeleted: false });

            let totalRestaurant = dbRestaurant.length;
            if (totalRestaurant == 0) {
                return res.success(
                    {
                        dbRestaurant,
                        totalRestaurant,
                    },
                    req.__('Not restaurant found')
                );
            } else {
                return res.success(
                    {
                        dbRestaurant,
                        totalRestaurant,
                    },
                    req.__('Restaurants in db fetched successfully')
                );
            }
        } catch (err) {
            return next(err);
        }
    }
    async getRestaurant(req, res, next) {
        try {
            console.log('-----------------Get Restaurant-----')
            let id = req.user._id;
            let restaurantId = req.query.restaurantId;
            let user = User.findOne({ _id: id, isDeleted: false });
            if (!user) {
                return res.warn('', 'User not found');
            } else {
                let restaurant = await Restaurant.findOne({
                    userId: id,
                    restaurantGuid: restaurantId,
                    isDeleted: false,
                });
                if (!restaurant) {
                    return res.warn('', 'Restaurent not available');
                } else {
                    return res.success(
                        {
                            restaurant,
                        },
                        req.__('Restaurant fetched successfully')
                    );
                }
            }
        } catch (err) {
            return next(err);
        }
    }
    async searchRestaurant(req, res, next) {
        try {
            console.log('-----------------Search Restaurant-----')
            let id = req.user._id;
            const search = req.body.search;

            let user = User.findOne({ _id: id, isDeleted: false });
            if (!user) {
                return res.warn('', 'User not found');
            } else if (!search) {
                return res.warn('', 'enter restaurent name for seraching');
            } else {
                const searchValue = new RegExp(
                    search
                        .split(' ')
                        .filter(val => val)
                        .map(value => value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
                        .join('|'),
                    'i'
                );
                let restaurant = await Restaurant.find({
                    restaurantName: searchValue,
                    userId: id,
                    isDeleted: false,
                });
                let totalRestaurent = restaurant.length;
                if (totalRestaurent == 0) {
                    return res.success(
                        {
                            restaurant,
                            totalRestaurent,
                        },
                        req.__('Restaurant Not Found')
                    );
                }
                return res.success(
                    {
                        restaurant,
                        totalRestaurent,
                    },
                    req.__('Restaurant fetched successfully')
                );
            }
        } catch (err) {
            return next(err);
        }
    }


    //-------------------------------------------------------------DISCUONT API-------------------------------------------------------------------------------
    async discountGraph(req, res, next) {
        try {
            console.log('-----------------Discount Graph------')
            let { restaurantId, filterValue } = req.query;
            let id = req.user._id;
            let restaurant = await Restaurant.findOne({ restaurantGuid: restaurantId, userId: id, isDeleted: false });
            if (!restaurant) {
                return res.warn('', 'Restaurant not found');
            }
            var options = {
                'method': 'POST',
                'url': 'https://ws-sandbox-api.eng.toasttab.com/authentication/v1/authentication/login',
                'headers': {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "clientId": CLIENT_ID,
                    "clientSecret": CLIENT_SECRET,
                    "userAccessType": USER_ACCESS_TYPE
                })
            };

            function doRequest(options) {
                return new Promise(function (resolve, reject) {
                    request(options, function (error, res, body) {
                        if (!error && res.statusCode === 200) {
                            resolve(body);
                        } else {
                            reject(error);
                        }
                    });
                });
            }

            let TOKEN_DATA = await doRequest(options);
            let TOKEN = JSON.parse(TOKEN_DATA).token.accessToken;

            // console.log("=====================token==========", TOKEN, " ========================");

            let currentDate = moment()
            let start_date = currentDate.add(-filterValue, 'days').format('YYYY-MM-DD')
            console.log('---start_date-----------------------------', start_date)
            let currentYear = new Date().getFullYear()
            let currentMonth = new Date().getMonth() + 1
            let currentDay = new Date().getDate()
            let end_date = `${currentYear}-${currentMonth}-${currentDay}`
            console.log('----end_date---------------------------', end_date)

            var _options = {
                'method': 'GET',

                'url': 'https://ws-sandbox-api.eng.toasttab.com/orders/v2/ordersBulk?startDate=2019-07-13T18:00:00.000-0000&endDate=2019-07-13T22:00:00.000-0000',
                'headers': {
                    'Toast-Restaurant-External-ID': restaurantId,
                    'Authorization': `Bearer ${TOKEN}`
                }
            };
            request(_options, function (error, response) {
                if (error) throw new Error(error);
                let data = JSON.parse(response.body);
                data = data.map(x => {
                    let obj = {
                        orderId: x.guid,
                        voided: x.voided ? voided : false,
                        paymentMode: (x.checks[0].payments[0]?.type) ? x.checks[0].payments[0].type : null,
                        amount: x.checks[0].amount,
                        totalAmount: x.checks[0].totalAmount,
                        customer: x.checks[0].customer,
                        serverId: x.server.guid,
                        discount: (x.checks[0].appliedDiscounts[0]?.discountAmount) ? x.checks[0].appliedDiscounts[0].discountAmount : null,
                        approver: (x.checks[0].appliedDiscounts[0]?.approver) ? x.checks[0].appliedDiscounts[0].approver : null
                    };
                    return obj;
                })
                let totalDiscount = 0;
                data.map((discount) => {
                    totalDiscount += discount.discount ? discount.discount : 0
                })

                var groupBy = function (xs, key) {
                    return xs.reduce(function (rv, x) {
                        (rv[x[key]] = rv[x[key]] || []).push(x);
                        return rv;
                    }, {});
                };
                var groubedByTeam = groupBy(data, 'serverId')

                let allManager = [];
                Object.keys(groubedByTeam).forEach(function (key, index) {
                    let totalDiscount = 0;
                    groubedByTeam[key].map(e => {
                        totalDiscount += (e.discount) ? e.discount : 0;
                    });
                    let OBJ = {
                        totalDiscount: totalDiscount,
                        serverId: key,
                        name: 'ABC' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`
                    }
                    allManager.push(OBJ);
                });

                let managerDetail = allManager[0]
                start_date = moment(start_date).format('DD/MM/YYYY')

                return res.success({ start_date, totalDiscount, managerDetail, allManager }, 'Restaurant discounts fetched successfully !')
            });


        } catch (err) {
            console.log(err)
            return next(err)
        }
    }
    async managerDiscount(req, res, next) {
        try {
            console.log('-----------------Manager discount------')
            let { serverId } = req.query;
            let restaurantId = req.query.restaurantId;
            let filterValue = req.query.filterValue
            let id = req.user._id;
            let restaurant = await Restaurant.findOne({ restaurantGuid: restaurantId, userId: id, isDeleted: false });
            if (!restaurant) {
                return res.warn('', 'Restaurant not found');
            }
            var options = {
                'method': 'POST',
                'url': 'https://ws-sandbox-api.eng.toasttab.com/authentication/v1/authentication/login',
                'headers': {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "clientId": CLIENT_ID,
                    "clientSecret": CLIENT_SECRET,
                    "userAccessType": USER_ACCESS_TYPE
                })
            };

            function doRequest(options) {
                return new Promise(function (resolve, reject) {
                    request(options, function (error, res, body) {
                        if (!error && res.statusCode === 200) {
                            resolve(body);
                        } else {
                            reject(error);
                        }
                    });
                });
            }

            let TOKEN_DATA = await doRequest(options);
            //  console.log(TOKEN_DATA);
            let TOKEN = JSON.parse(TOKEN_DATA).token.accessToken;

            // console.log("=====================token==========", TOKEN, " ========================");

            let currentDate = moment()
            let start_date = currentDate.add(-filterValue, 'days').format('YYYY-MM-DD')
            console.log('---start_date-----------------------------', start_date)
            let currentYear = new Date().getFullYear()
            let currentMonth = new Date().getMonth() + 1
            let currentDay = new Date().getDate()
            let end_date = `${currentYear}-${currentMonth}-${currentDay}`
            console.log('----end_date---------------------------', end_date)

            var _options = {
                'method': 'GET',

                'url': 'https://ws-sandbox-api.eng.toasttab.com/orders/v2/ordersBulk?startDate=2019-07-13T18:00:00.000-0000&endDate=2019-07-13T22:00:00.000-0000',
                'headers': {
                    'Toast-Restaurant-External-ID': restaurantId,
                    'Authorization': `Bearer ${TOKEN}`
                }
            };
            request(_options, function (error, response) {
                if (error) throw new Error(error);
                //console.log(response.body);
                let data = JSON.parse(response.body);
                data = data.map(x => {
                    let obj = {
                        date: moment(x.createdDate).format('YYYY-MM-DD HH:mm:ss'),
                        orderId: x.guid,
                        voided: x.voided ? voided : false,
                        paymentMode: (x.checks[0].payments[0]?.type) ? x.checks[0].payments[0].type : null,
                        amount: x.checks[0].amount,
                        totalAmount: x.checks[0].totalAmount,
                        customer: x.checks[0].customer,
                        serverId: x.server.guid,
                        discount: (x.checks[0].appliedDiscounts[0]?.discountAmount) ? x.checks[0].appliedDiscounts[0].discountAmount : null,
                        approver: (x.checks[0].appliedDiscounts[0]?.approver) ? x.checks[0].appliedDiscounts[0].approver : null
                    };
                    return obj;
                })

                var groupBy = function (xs, key) {
                    return xs.reduce(function (rv, x) {
                        (rv[x[key]] = rv[x[key]] || []).push(x);
                        return rv;
                    }, {});
                };
                // console.log('-------data-----------',data,' --------data------');
                var groubedByTeam = groupBy(data, 'serverId')
                // console.log('-------groubedByTeam-----------',groubedByTeam);

                let r = [];
                Object.keys(groubedByTeam).forEach(function (key, index) {
                    if (key === serverId) {
                        r = groubedByTeam[key].map(e => {
                            return {
                                date: e.date,
                                orderId: e.orderId,
                                customer: 'ABC' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`,
                                server: 'XYZ' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`,
                                Approver: 'MNO' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`,
                                discount: (e.discount) ? e.discount : 0
                            }
                        });
                    }
                });

                let totalDiscount = 0;
                r.map((discount) => {
                    totalDiscount += discount.discount ? discount.discount : 0
                })

                start_date = moment(start_date).format('DD/MM/YYYY')
                return res.success({ start_date, totalDiscount, r }, 'Restaurant discounts fetched successfully !')
            });
            // console.log(JSON.stringify(discountData ));


        } catch (err) {
            console.log(err)
            return next(err)
        }
    }
    async orderDiscount(req, res, next) {
        try {
            console.log('-----------------Order Discount--------')
            let { serverId, orderId, restaurantId, filterValue } = req.query;
            let id = req.user._id;
            let restaurant = await Restaurant.findOne({ restaurantGuid: restaurantId, userId: id, isDeleted: false });
            if (!restaurant) {
                return res.warn('', 'Restaurant not found');
            }
            var options = {
                'method': 'POST',
                'url': 'https://ws-sandbox-api.eng.toasttab.com/authentication/v1/authentication/login',
                'headers': {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "clientId": CLIENT_ID,
                    "clientSecret": CLIENT_SECRET,
                    "userAccessType": USER_ACCESS_TYPE
                })
            };

            function doRequest(options) {
                return new Promise(function (resolve, reject) {
                    request(options, function (error, res, body) {
                        if (!error && res.statusCode === 200) {
                            resolve(body);
                        } else {
                            reject(error);
                        }
                    });
                });
            }

            let TOKEN_DATA = await doRequest(options);
            //  console.log(TOKEN_DATA);
            let TOKEN = JSON.parse(TOKEN_DATA).token.accessToken;

            // console.log("=====================token==========", TOKEN, " ========================");

            let currentDate = moment()
            let start_date = currentDate.add(-filterValue, 'days').format('YYYY-MM-DD')
            console.log('---start_date-----------------------------', start_date)
            let currentYear = new Date().getFullYear()
            let currentMonth = new Date().getMonth() + 1
            let currentDay = new Date().getDate()
            let end_date = `${currentYear}-${currentMonth}-${currentDay}`
            console.log('----end_date---------------------------', end_date)

            var _options = {
                'method': 'GET',

                'url': 'https://ws-sandbox-api.eng.toasttab.com/orders/v2/ordersBulk?startDate=2019-07-13T18:00:00.000-0000&endDate=2019-07-13T22:00:00.000-0000',
                'headers': {
                    'Toast-Restaurant-External-ID': restaurantId,
                    'Authorization': `Bearer ${TOKEN}`
                }
            };
            request(_options, function (error, response) {
                if (error) throw new Error(error);
                let data = JSON.parse(response.body);
                data = data.map(x => {
                    let obj = {
                        orderId: x.guid,
                        voided: x.voided ? voided : false,
                        paymentMode: (x.checks[0].payments[0]?.type) ? x.checks[0].payments[0].type : null,
                        amount: x.checks[0].amount,
                        totalAmount: x.checks[0].totalAmount,
                        customer: x.checks[0].customer,
                        serverId: x.server.guid,
                        discount: (x.checks[0].appliedDiscounts[0]?.discountAmount) ? x.checks[0].appliedDiscounts[0].discountAmount : null,
                        approver: (x.checks[0].appliedDiscounts[0]?.approver) ? x.checks[0].appliedDiscounts[0].approver : null,
                        menuItem: (x.checks[0].selections[0]) ? x.checks[0].selections : null
                    };
                    return obj;
                })

                let totalDiscount = 0;
                data.map((discount) => {
                    totalDiscount += discount.discount ? discount.discount : 0
                })

                var groupBy = function (xs, key) {
                    return xs.reduce(function (rv, x) {
                        (rv[x[key]] = rv[x[key]] || []).push(x);
                        return rv;
                    }, {});
                };
                // console.log('-------data-----------',data,' --------data------');
                var groubedByTeam = groupBy(data, 'serverId')
                // console.log('-------groubedByTeam-----------',groubedByTeam,'--------------------');

                let r;
                Object.keys(groubedByTeam).forEach(function (key, index) {
                    if (key === serverId) {
                        r = groubedByTeam[key].map(e => {
                            if (e.orderId === orderId) {
                                let items_ = []
                                e.menuItem.map((x) => {
                                    let obj = {
                                        displayName: x.displayName,
                                        price: x.price,
                                        date: x.createdDate,
                                    }

                                    items_.push(obj)
                                })
                                return {
                                    orderId: e.orderId,
                                    customer: 'ABC' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`,
                                    server: 'XYZ' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`,
                                    Approver: 'MNO' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`,
                                    discount: (e.discount) ? e.discount : 0,
                                    menuItem: items_

                                }
                            }
                        })[0];
                    }
                });
                start_date = moment(start_date).format('DD/MM/YYYY')

                return res.success({ start_date, totalDiscount, r }, 'Restaurant discounts fetched successfully !')
            });

        } catch (err) {
            console.log(err)
            return next(err)
        }
    }
    async discounts(req, res, next) {
        try {
            let { restId } = req.query;
            if (restId) {

                var options = {
                    'method': 'POST',
                    'url': 'https://ws-sandbox-api.eng.toasttab.com/authentication/v1/authentication/login',
                    'headers': {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "clientId": CLIENT_ID,
                        "clientSecret": CLIENT_SECRET,
                        "userAccessType": USER_ACCESS_TYPE
                    })
                };

                function doRequest(options) {
                    return new Promise(function (resolve, reject) {
                        request(options, function (error, res, body) {
                            if (!error && res.statusCode === 200) {
                                resolve(body);
                            } else {
                                reject(error);
                            }
                        });
                    });
                }

                let TOKEN_DATA = await doRequest(options);
                let TOKEN = JSON.parse(TOKEN_DATA).token.accessToken;

                var _options = {
                    'method': 'GET',
                    'url': 'https://ws-sandbox-api.eng.toasttab.com/config/v2/discounts',
                    'headers': {
                        'Toast-Restaurant-External-ID': restId,
                        'Authorization': `Bearer ${TOKEN}`
                    }
                };

                request(_options, function (error, response) {
                    if (error) throw new Error(error);
                    let discounts = JSON.parse(response.body)
                    return res.success({ discounts }, 'Restaurant discounts fetched successfully !')
                });
            }

        } catch (err) {
            return next(err)
        }
    }
    async discountHighlight(req, res, next) {
        console.log('-----------------discountHighlight------')
        try {
            let { restaurantId, filterValue, discountThreshold } = req.query;
            let id = req.user._id;
            let restaurant = await Restaurant.findOne({ restaurantGuid: restaurantId, userId: id, isDeleted: false });
            let threshold = await Threshold.findOne({ slug:discountThreshold, restaurantId: restaurantId, userId: id, isDeleted: false });
            let _threshold=threshold?threshold.threshold:0;
            console.log('Threshold: ',threshold)
            if (!restaurant) {
                return res.warn('', 'Restaurant not found');
            }
            var options = {
                'method': 'POST',
                'url': 'https://ws-sandbox-api.eng.toasttab.com/authentication/v1/authentication/login',
                'headers': {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "clientId": CLIENT_ID,
                    "clientSecret": CLIENT_SECRET,
                    "userAccessType": USER_ACCESS_TYPE
                })
            };

            function doRequest(options) {
                return new Promise(function (resolve, reject) {
                    request(options, function (error, res, body) {
                        if (!error && res.statusCode === 200) {
                            resolve(body);
                        } else {
                            reject(error);
                        }
                    });
                });
            }

            let TOKEN_DATA = await doRequest(options);
            let TOKEN = JSON.parse(TOKEN_DATA).token.accessToken;

            // console.log("=====================token==========", TOKEN, " ========================");

            let currentDate = moment()
            let start_date = currentDate.add(-filterValue, 'days').format('YYYY-MM-DD')
            console.log('---start_date-----------------------------', start_date)
            let currentYear = new Date().getFullYear()
            let currentMonth = new Date().getMonth() + 1
            let currentDay = new Date().getDate()
            let end_date = `${currentYear}-${currentMonth}-${currentDay}`
            console.log('----end_date---------------------------', end_date)

            var _options = {
                'method': 'GET',

                'url': 'https://ws-sandbox-api.eng.toasttab.com/orders/v2/ordersBulk?startDate=2018-07-13T18:00:00.000-0000&endDate=2020-07-13T22:00:00.000-0000',
                'headers': {
                    'Toast-Restaurant-External-ID': restaurantId,
                    'Authorization': `Bearer ${TOKEN}`
                }
            };
            request(_options, function (error, response) {
                if (error) throw new Error(error);
                let data = JSON.parse(response.body);
                data = data.map(x => {
                    let obj = {
                        orderId: Math.floor(Math.random() * 10000),
                        voided: x.voided?x.voided : false,
                        paymentMode: (x.checks[0]?.payments[0]?.type) ? x.checks[0]?.payments[0]?.type : null,
                        amount: x.checks[0]?.amount?x.checks[0]?.amount:0,
                        totalAmount: x.checks[0]?.totalAmount?x.checks[0]?.totalAmount:0,
                        customer: x.checks[0]?.customer?x.checks[0]?.customer:null,
                        serverId: x.server.guid,
                        discount: (x.checks[0]?.appliedDiscounts[0]?.discountAmount) ? x.checks[0].appliedDiscounts[0].discountAmount : null,
                        approver: (x.checks[0]?.appliedDiscounts[0]?.approver) ? x.checks[0].appliedDiscounts[0].approver : null,
                        date: moment(x.createdDate).format('YYYY-MM-DD HH:mm:ss'),

                    };
                    return obj;
                })

                  data.map(e=>{
                                e.customer= 'ABC' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`;
                                e.server= 'XYZ' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`;
                                e.Approver= 'MNO' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`;
                                e.discount= (e.discount) ? e.discount : 0
                  })

                let totalDiscount = 0;
                data.map((discount) => {
                    if(discount){
                        totalDiscount += discount?.discount ? discount.discount : 1;
                        if (totalDiscount<_threshold) discount.highlight=false;
                        else discount.highlight=true;
                    }
                   
                });
               

                // var groupBy = function (xs, key) {
                //     return xs.reduce(function (rv, x) {
                //         (rv[x[key]] = rv[x[key]] || []).push(x);
                //         return rv;
                //     }, {});
                // };
                // var groubedByTeam = groupBy(data, 'serverId')

                // let allManager = [];
                // Object.keys(groubedByTeam).forEach(function (key, index) {
                //     let totalDiscount = 0;
                //     groubedByTeam[key].map(e => {
                //         totalDiscount += (e.discount) ? e.discount : 0;
                //     });
                //     let OBJ = {
                //         totalDiscount: totalDiscount,
                //         serverId: key,
                //         name: 'ABC' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`
                //     }
                //     allManager.push(OBJ);
                // });

                // let managerDetail = allManager[0]
                // start_date = moment(start_date).format('DD/MM/YYYY')

                return res.success({ totalDiscount,_threshold,data }, 'Restaurant discounts fetched successfully !')
            });


        } catch (err) {
            console.log(err)
            return next(err)
        }
    }


    // -------------------------------------------------------------EVENT API---------------------------------------------------------------------------------
    async addEvent(req, res, next) {
        try {
            console.log('-----------------addEvent----------')
            let {
                eventTitle,
                eventName,
                eventDate,
                time,
                timeFormat,
                additionalNotes,
            } = req.body;
            let id = req.user._id;
            let restaurantId = req.query.restaurantId;
            let restaurant = await Restaurant.findOne({ restaurantGuid: (restaurantId), userId: id, isDeleted: false });

            if (!restaurant) {
                return res.warn('', 'Restaurant not found');
            } else {
                let event = new Events();
                event.eventTitle = eventTitle;
                event.eventName = eventName;
                event.eventDate = eventDate;
                event.time = time;
                event.timeFormat = timeFormat;
                event.additionalNotes = additionalNotes;
                event.userId = id;
                event.restaurantId = restaurantId;

                console.log('req.body.eventDate---------',eventDate)
                console.log('req.body.time---------',time)
                let saveEvent = await event.save();
                let event_time = saveEvent.time;
                let event_date = saveEvent.eventDate;




                // let draftDate = '2023-03-21';
                // let draftTime = '2:00'

                var event_get = moment(`${event_date}${event_time}`, 'YYYY-MM-DD HH:mm:ss').format();
                console.log(event_get);

                // let event_get = moment(`${event_date}${event_time}`).format('YYYY-MM-DD HH:mm:ss')
                console.log('event_get---------------',event_get)
                var date = new Date(event_get);
                console.log('date----------------',date)

                var d = date.getDate();
                var m = date.getMonth();
                var h = date.getHours();
                var mi = date.getMinutes();
                console.log('day,month,hour,minute', d, m, h, mi)
                var job = new CronJob(
                    `0 ${mi} ${h} ${d} ${m} *`,
                    async function () {
                        console.log('-----enter Notification ----------')
                        let notification = new Notification();
                        notification.eventName = saveEvent.eventName;
                        notification.eventTitle = saveEvent.eventTitle;
                        notification.additionalNotes = saveEvent.additionalNotes;
                        notification.restaurantId = saveEvent.restaurantId;
                        notification.userId = id;
                        await notification.save();

                        let user = await User.findOne({ _id: req._id });
                        let token = [];

                        token.push(user.deviceToken);
                        let msg = {
                            "registration_ids": token,

                            "notification": {
                                "sound": "default",
                                "title": "Event Notification",
                                "type": "EVENT_NOTIFICATION",
                                "body": `Event`,

                            }
                        }
                        fcm.send(msg, function (err, response) {
                            if (err) {
                                console.log('Something has gone wrong!' + err);
                            } else {
                                console.log('Successfully sent with response: ', response);
                            }
                        });
                    },
                    null,
                    true
                );
                job.start();


                if (saveEvent) {
                    return res.success(
                        {
                            saveEvent,
                        },
                        req.__('Event created successfully')
                    );
                } else {
                    return res.warn(
                        {
                            saveEvent,
                        },
                        req.__('Event not created')
                    );
                }


            }
        } catch (err) {
            console.log(err)
            return next(err);
        }
    }
    async getOneEvents(req, res, next) {
        try {
            console.log('-----------------getOneEvent-----------')
            let id = req.user._id;
            let restaurantId = req.query.restaurantId;
            let eventDate = req.query.eventDate;
            console.log('eventDate: ',eventDate)
            let restaurant = await Restaurant.findOne({ restaurantGuid: restaurantId, userId: id, isDeleted: false });

            if (!restaurant) {
                return res.warn('', 'Restaurant not found');
            } else {
                let events = await Events.find({ restaurantId: restaurantId, eventDate: eventDate, userId: id, isDeleted: false });
                if (!events) {
                    return res.warn('', 'Event not found');
                }
                return res.success(
                    {
                        events,
                    },
                    req.__('Event fetched successfully ')
                );

            }
        } catch (err) {
            return next(err);
        }
    }
    async getAllEvents(req, res, next) {
        try {
            console.log('-----------------Get All Event------')
            let id = req.user._id;
            let restaurantId = req.query.restaurantId;
            let restaurant = await Restaurant.findOne({ restaurantGuid: restaurantId, userId: id, isDeleted: false });

            if (!restaurant) {
                return res.warn('', 'Restaurant not found');
            } else {
                let events = await Events.find({ restaurantId: restaurantId, userId: id, isDeleted: false });
                if (!events) {
                    return res.warn('', 'Event not found');
                }
                return res.success(
                    {
                        events,
                    },
                    req.__('Event fetched successfully ')
                );

            }
        } catch (err) {
            console.log(err)
            return next(err);
        }
    }


    //----------------------------------------------------------------ORDER API--------------------------------------------------------------------------------
    async getOrder(req, res, next) {
        try {
            console.log('-----------------Get Order-----')
            let { restaurantId, filterValue } = req.query;
            let id = req.user._id;
            let restaurant = await Restaurant.findOne({ restaurantGuid: restaurantId, userId: id, isDeleted: false });
            if (!restaurant) {
                return res.warn('', 'Restaurant not found');
            }
            var options = {
                'method': 'POST',
                'url': 'https://ws-sandbox-api.eng.toasttab.com/authentication/v1/authentication/login',
                'headers': {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "clientId": CLIENT_ID,
                    "clientSecret": CLIENT_SECRET,
                    "userAccessType": USER_ACCESS_TYPE
                })
            };

            function doRequest(options) {
                return new Promise(function (resolve, reject) {
                    request(options, function (error, res, body) {
                        if (!error && res.statusCode === 200) {
                            resolve(body);
                        } else {
                            reject(error);
                        }
                    });
                });
            }

            let TOKEN_DATA = await doRequest(options);
            //  console.log(TOKEN_DATA);
            let TOKEN = JSON.parse(TOKEN_DATA).token.accessToken;

            // console.log("====================", TOKEN,"=============");

            let currentDate = moment()
            let start_date = currentDate.add(-filterValue, 'days').format('YYYY-MM-DD')
            console.log('---start_date-----------------------------', start_date)
            let currentYear = new Date().getFullYear()
            let currentMonth = new Date().getMonth() + 1
            let currentDay = new Date().getDate()
            let end_date = `${currentYear}-${currentMonth}-${currentDay}`
            console.log('----end_date---------------------------', end_date)


            var _options = {
                'method': 'GET',

                'url': 'https://ws-sandbox-api.eng.toasttab.com/orders/v2/ordersBulk?startDate=2019-07-13T18:00:00.000-0000&endDate=2019-07-13T22:00:00.000-0000',
                'headers': {
                    'Toast-Restaurant-External-ID': restaurantId,
                    'Authorization': `Bearer ${TOKEN}`
                }
            };
            request(_options, function (error, response) {
                if (error) throw new Error(error);
                //console.log(response.body);
                let data = JSON.parse(response.body);
                data = data.map(x => {
                    let obj = {
                        date: moment(x.createdDate).format('YYYY-MM-DD'),
                        orderId: x.guid,
                        customer: 'ABC' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`,
                        // serverId: x.server.guid,
                        serverId: 'MNO' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`,
                        // discount: (x.checks[0].appliedDiscounts[0]?.discountAmount) ? x.checks[0].appliedDiscounts[0].discountAmount : null,
                        approver: 'XYZ' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`,
                        // approver: (x.checks[0].appliedDiscounts[0]?.approver) ? x.checks[0].appliedDiscounts[0].approver : null
                    };
                    return obj;
                })
                // console.log(data);
                var filename = 'MNO' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}.pdf`;

                var options = {
                    format: 'A3',
                    orientation: 'portrait',
                    border: '10mm',
                };

                var document = {
                    html: html,
                    data: { data_: data },
                    path: filename,
                    type: '',
                    headers: {
                        'content-type': 'multipart/form-data',
                    },
                };

                pdf.create(document, options)
                    .then(async response => {
                        console.log('------------------create PDF-----------------')
                        let newpath = path.join(__dirname, './../../../../', document.path);

                        document.path = newpath;
                        let file_ = await uploadImage(document, 'create_order_detail');
                        console.log('----------upload PDF-----', file_);

                        let pdfUrl_ = file_.Key;

                        fs.unlink(newpath, err => {
                            console.log("------------delete pdf------------")
                            if (err) console.log(err);
                            else {
                                console.log(
                                    'Deleted file: example_file.txt because (created&log) pdf Exist'
                                );
                            }
                        });

                        console.log('--------PDF Create Successfully----------')

                        return res.success({ pdfUrl_, data }, 'Restaurant order fetched successfully !')
                    })
                    .catch(error => {
                        console.error(error, 'error');
                        return error
                    });

            });


        } catch (err) {
            console.log(err)
            return next(err)
        }
    }
    async searchOrder(req, res, next) {
        try {
            console.log('-----------------Search Order-----')
            let id = req.user._id;
            const search = req.body.search;
            const restaurantId = req.query.restaurantId;

            let user = User.findOne({ _id: id, isDeleted: false });
            if (!user) {
                return res.warn('', 'User not found');
            }
            if (!search) {
                return res.warn('', 'Enter restaurent name for seraching');
            }


            var options = {
                'method': 'POST',
                'url': 'https://ws-sandbox-api.eng.toasttab.com/authentication/v1/authentication/login',
                'headers': {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "clientId": CLIENT_ID,
                    "clientSecret": CLIENT_SECRET,
                    "userAccessType": USER_ACCESS_TYPE
                })
            };

            function doRequest(options) {
                return new Promise(function (resolve, reject) {
                    request(options, function (error, res, body) {
                        if (!error && res.statusCode === 200) {
                            resolve(body);
                        } else {
                            reject(error);
                        }
                    });
                });
            }

            let TOKEN_DATA = await doRequest(options);
            //  console.log(TOKEN_DATA);
            let TOKEN = JSON.parse(TOKEN_DATA).token.accessToken;

            // console.log("====================", TOKEN,"=============");

            var _options = {
                'method': 'GET',

                'url': 'https://ws-sandbox-api.eng.toasttab.com/orders/v2/ordersBulk?startDate=2019-07-13T18:00:00.000-0000&endDate=2019-07-13T22:00:00.000-0000',
                'headers': {
                    'Toast-Restaurant-External-ID': restaurantId,
                    'Authorization': `Bearer ${TOKEN}`
                }
            };
            request(_options, function (error, response) {
                if (error) throw new Error(error);
                //console.log(response.body);
                let data = JSON.parse(response.body);
                data = data.map(x => {
                    // if ()
                    let obj = {
                        date: x.createdDate,
                        orderId: x.guid,
                        // voided: x.voided ? voided : false,
                        // paymentMode: (x.checks[0].payments[0]?.type) ? x.checks[0].payments[0].type : null,
                        // amount: x.checks[0].amount,
                        // totalAmount: x.checks[0].totalAmount,
                        // customer: x.checks[0].customer,
                        customer: 'ABC' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`,
                        // serverId: x.server.guid,
                        serverId: 'MNO' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`,
                        // discount: (x.checks[0].appliedDiscounts[0]?.discountAmount) ? x.checks[0].appliedDiscounts[0].discountAmount : null,
                        approver: 'XYZ' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`,
                        // approver: (x.checks[0].appliedDiscounts[0]?.approver) ? x.checks[0].appliedDiscounts[0].approver : null
                    };
                    return obj;
                })
                // console.log(data);

                // return res.success({ data }, 'Restaurant order fetched successfully !')

                const searchValue = new RegExp(
                    search
                        .split(' ')
                        .filter(val => val)
                        .map(value => value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
                        .join('|'),
                    'i'
                );

                let searchCustomer = []
                const match = data.map(value => {
                    if (searchValue.test(value.customer)) {
                        searchCustomer.push(value)
                    }
                });

                console.log('----match----', match)

                return res.success({ data }, 'Restaurant order fetched successfully !')


            });

        } catch (err) {
            console.log(err)
            return next(err);
        }
    }


    //-------------------------------------------------------------THRESHOLD FLAG API---------------------------------------------------------------------------
    async threshold(req, res, next) {
        try {
            console.log('-----------------Add Threshold-------')
            let threshold = req.body.threshold;

            console.log(typeof threshold)
            console.log(threshold)
            let id = req.user._id;
            let restaurantId = req.query.restaurantId;
            let slug = req.query.slug;

            let restaurant = await Restaurant.findOne({ restaurantGuid: restaurantId, userId: id, isDeleted: false });
            let value = await Threshold.findOne({ slug: slug, isDeleted: false })
            // console.log('----value---', restaurant)
            // console.log('----value2---', value)
            if (!restaurant) {
                return res.warn('', 'Restaurant not found');
            }
            if (!value) {
                return res.warn('', 'Slug not found')
            }

            console.log(typeof threshold)
            console.log(threshold)
            if (typeof Number(threshold) != 'number') {
                return res.warn('', 'Threshold not a number')
            }
            // console.log((typeof threshold == 'Number'))
            // if(typeof threshold == 'Number'){
            //     return res.warn('', 'Threshold value not a numer')
            // }
            value.slug = slug;
            value.threshold = threshold;
            value.userId = id;
            value.restaurantId = restaurantId;


            let saveThreshold = await value.save();
            if (saveThreshold) {
                return res.success(
                    {
                        saveThreshold,
                    },
                    req.__('Threshold added successfully')
                );
            } else {
                return res.warn(
                    {
                        saveThreshold,
                    },
                    req.__('Threshold not created')
                );
            }

        } catch (err) {
            console.log(err)
            return next(err);
        }
    }
    async getThreshold(req, res, next) {
        try {
            console.log('-----------------Get Threshold--------')
            let id = req.user._id;
            let restaurantId = req.query.restaurantId;
            let slug = req.query.slug;

            let restaurant = await Restaurant.findOne({ restaurantGuid: restaurantId, userId: id, isDeleted: false });
            // console.log('--thresold--', restaurant)
            let void_slug = await Threshold.findOne({ slug: 'void_slug' })
            let credit_slug = await Threshold.findOne({ slug: 'credit_slug' })
            let discount_slug = await Threshold.findOne({ slug: 'discounts_slug' })

            // console.log('------void_slug---', void_slug)
            // console.log('------discounts_slug---', discounts_slug)

            if (!restaurant) {
                return res.warn('', 'Restaurant not found');
            }
            // if(!threshold){
            //     return res.warn('', 'Slug not found')
            // }
            // return res.success(
            //     {
            //         threshold,
            //     },
            //     req.__('Threshold get successfully')
            // );

            var options = {
                'method': 'POST',
                'url': 'https://ws-sandbox-api.eng.toasttab.com/authentication/v1/authentication/login',
                'headers': {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "clientId": CLIENT_ID,
                    "clientSecret": CLIENT_SECRET,
                    "userAccessType": USER_ACCESS_TYPE
                })
            };

            function doRequest(options) {
                return new Promise(function (resolve, reject) {
                    request(options, function (error, res, body) {
                        if (!error && res.statusCode === 200) {
                            resolve(body);
                        } else {
                            reject(error);
                        }
                    });
                });
            }

            let TOKEN_DATA = await doRequest(options);
            //  console.log(TOKEN_DATA);
            let TOKEN = JSON.parse(TOKEN_DATA).token.accessToken;

            // console.log("=====================token==========", TOKEN, " ========================");

            var _options = {
                'method': 'GET',

                'url': 'https://ws-sandbox-api.eng.toasttab.com/orders/v2/ordersBulk?startDate=2018-07-13T18:00:00.000-0000&endDate=2022-07-13T22:00:00.000-0000',
                'headers': {
                    'Toast-Restaurant-External-ID': 'f94c4e4e-0ac1-4433-a827-15290338a028',
                    'Authorization': `Bearer ${TOKEN}`
                }
            };
            request(_options, function (error, response) {
                if (error) throw new Error(error);
                //console.log(response.body);
                let data = JSON.parse(response.body);
                data = data.map(x => {
                    let obj = {
                        orderId: x.guid,
                        voided: x.voided ? voided : false,
                        paymentMode: (x.checks[0] && x.checks[0].payments[0]?.type) ? x.checks[0].payments[0].type : null,
                        amount: x.checks[0] ? x.checks[0].amount : 0,
                        totalAmount: x.checks[0] ? x.checks[0].totalAmount : 0,
                        customer: x.checks[0] ? x.checks[0].customer : {},
                        serverId: x.checks[0] ? x.server.guid : '',
                        discount: (x.checks[0] && x.checks[0].appliedDiscounts[0]?.discountAmount) ? x.checks[0].appliedDiscounts[0].discountAmount : null,
                        approver: (x.checks[0] && x.checks[0].appliedDiscounts[0]?.approver) ? x.checks[0].appliedDiscounts[0].approver : null
                    };
                    return obj;
                })
                let totalCredit = 0;
                let TOTAL_AMOUNT = 0;
                let arr = []
                data.map((r) => {
                    TOTAL_AMOUNT += r.totalAmount ? r.totalAmount : 0
                    if (r.paymentMode == 'CREDIT') {
                        arr.push(r)
                        totalCredit += r.totalAmount ? r.totalAmount : 0
                    }
                    // console.log('------data----', arr, ' -----------data----------')
                })

                let totalVoid = 0
                data.map((r) => {
                    if (r.voided) {
                        arr.push(r)
                        totalVoid += r.totalAmount ? r.totalAmount : 0
                    }
                })

                let totalDiscount = 0
                data.map((r) => {
                    if (r.discount) {
                        arr.push(r)
                        totalDiscount += r.discount ? r.discount : 0
                    }
                })

                let discountThre = {
                    type: 'DISCOUNT',
                    flag: totalDiscount > discount_slug.threshold ? true : false
                }
                console.log('------totalDiscount----', totalDiscount, ' -----------data----------')
                console.log('------discount_slug.threshold----', discount_slug.threshold, ' -----------data----------')

                let totalCreditPer = (totalCredit / TOTAL_AMOUNT) * 100;

                console.log('------data----', totalVoid, ' -----------data----------')
                console.log('------void_slug.threshold----', void_slug.threshold, ' -----------data----------')

                let voidsThre = {
                    type: 'VOID',
                    flag: totalVoid > void_slug.threshold ? true : false
                }
                let creditThre = {
                    type: 'CREDIT',
                    flag: totalCreditPer > credit_slug.threshold ? true : false
                }
                console.log('------totalCreditPer----', totalCreditPer, ' -----------data----------')
                console.log('------credit_slug.threshold----', credit_slug.threshold, ' -----------data----------')
                return res.success({ creditThre, voidsThre, discountThre }, 'Threshold fetched successfully !')
            });
            // console.log(JSON.stringify(discountData ));




        } catch (err) {
            console.log(err)
            return next(err);
        }
    }


    //--------------------------------------------------------------- CREDIT-CARD API---------------------------------------------------------------------------
    async getCredit(req, res, next) {
        try {
            console.log('-----------------Get Credit--------')
            let id = req.user._id;
            let { filterValue, restaurantId } = req.query

            let restaurant = await Restaurant.findOne({ restaurantGuid: restaurantId, userId: id, isDeleted: false });

            if (!restaurant) {
                return res.warn('', 'Restaurant not found');
            }

            var options = {
                'method': 'POST',
                'url': 'https://ws-sandbox-api.eng.toasttab.com/authentication/v1/authentication/login',
                'headers': {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "clientId": CLIENT_ID,
                    "clientSecret": CLIENT_SECRET,
                    "userAccessType": USER_ACCESS_TYPE
                })
            };

            function doRequest(options) {
                return new Promise(function (resolve, reject) {
                    request(options, function (error, res, body) {
                        if (!error && res.statusCode === 200) {
                            resolve(body);
                        } else {
                            reject(error);
                        }
                    });
                });
            }

            let TOKEN_DATA = await doRequest(options);
            //  console.log(TOKEN_DATA);
            let TOKEN = JSON.parse(TOKEN_DATA).token.accessToken;

            // console.log("=====================token==========", TOKEN, " ========================");

            let currentDate = moment()
            let start_date = currentDate.add(-filterValue, 'days').format('YYYY-MM-DD')
            console.log('---start_date-----------------------------', start_date)
            let currentYear = new Date().getFullYear()
            let currentMonth = new Date().getMonth() + 1
            let currentDay = new Date().getDate()
            let end_date = `${currentYear}-${currentMonth}-${currentDay}`
            console.log('----end_date---------------------------', end_date)

            var _options = {
                'method': 'GET',

                'url': 'https://ws-sandbox-api.eng.toasttab.com/orders/v2/ordersBulk?startDate=2018-07-13T18:00:00.000-0000&endDate=2022-07-13T22:00:00.000-0000',
                'headers': {
                    'Toast-Restaurant-External-ID': restaurantId,
                    'Authorization': `Bearer ${TOKEN}`
                }
            };
            request(_options, function (error, response) {
                if (error) throw new Error(error);
                //console.log(response.body);
                let data = JSON.parse(response.body);
                data = data.map(x => {
                    let obj = {
                        date: moment(x.createdDate).format('YYYY-MM-DD'),
                        orderId: x.guid,
                        // voided: x.voided ? voided : false,
                        paymentMode: (x.checks[0] && x.checks[0].payments[0]?.type) ? x.checks[0].payments[0].type : null,
                        amount: x.checks[0] ? x.checks[0].amount : 0,
                        totalAmount: x.checks[0] ? x.checks[0].totalAmount : 0,
                        // customer: x.checks[0] ? x.checks[0].customer : {},
                        customer: 'ABC' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`,
                        server: 'XYZ' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`,
                        Approver: 'MNO' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`,
                        // serverId: x.checks[0] ? x.server.guid : '',
                        // discount: (x.checks[0] && x.checks[0].appliedDiscounts[0]?.discountAmount) ? x.checks[0].appliedDiscounts[0].discountAmount : null,
                        // approver: (x.checks[0] && x.checks[0].appliedDiscounts[0]?.approver) ? x.checks[0].appliedDiscounts[0].approver : null,
                        items: x.checks[0] && x.checks[0].selections.map(item => item.displayName)
                    };
                    return obj;
                })
                let totalCredit = 0;
                let TOTAL_AMOUNT = 0;
                const credit_data = []
                data.map((r) => {
                    TOTAL_AMOUNT += r.totalAmount ? r.totalAmount : 0
                    if (r.paymentMode == 'CREDIT') {
                        credit_data.push(r)
                        totalCredit += r.totalAmount ? r.totalAmount : 0
                    }
                })

                const totalCreditPer = (totalCredit / TOTAL_AMOUNT) * 100;
                var d = new Date();

                // var Date_ = ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + d.getFullYear() + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
                var Date_ = moment(start_date).format('DD/MM/YYYY')

                // console.log('-----date',Date_)
                // console.log('------data----', arr, ' -----------data----------')
                return res.success({ Date_, totalCreditPer, credit_data }, 'Credit data fetched successfully !')
            });
            // console.log(JSON.stringify(discountData ));




        } catch (err) {
            console.log(err)
            return next(err);
        }
    }


    //--------------------------------------------------------------- VOID API---------------------------------------------------------------------------
    async voidGraph(req, res, next) {
        try {
            console.log('-----------------Void get-------')
            let id = req.user._id;
            let { restaurantId, filterValue } = req.query;
            let restaurant = await Restaurant.findOne({ restaurantGuid: restaurantId, userId: id, isDeleted: false });
            // console.log('-----filterValue------',filterValue,'---------')
            // console.log('-----filterValue Type------',typeof filterValue,'---------')
            if (!restaurant) {
                return res.warn('', 'Restaurant not found');
            }

            var options = {
                'method': 'POST',
                'url': 'https://ws-sandbox-api.eng.toasttab.com/authentication/v1/authentication/login',
                'headers': {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "clientId": CLIENT_ID,
                    "clientSecret": CLIENT_SECRET,
                    "userAccessType": USER_ACCESS_TYPE
                })
            };

            function doRequest(options) {
                return new Promise(function (resolve, reject) {
                    request(options, function (error, res, body) {
                        if (!error && res.statusCode === 200) {
                            resolve(body);
                        } else {
                            reject(error);
                        }
                    });
                });
            }

            let TOKEN_DATA = await doRequest(options);
            //  console.log(TOKEN_DATA);
            let TOKEN = JSON.parse(TOKEN_DATA).token.accessToken;

            let currentDate = moment()
            let start_date = currentDate.add(-filterValue, 'days').format('YYYY-MM-DD')
            console.log('---start_date-----------------------------', start_date)
            let currentYear = new Date().getFullYear()
            let currentMonth = new Date().getMonth() + 1
            let currentDay = new Date().getDate()
            let end_date = `${currentYear}-${currentMonth}-${currentDay}`
            console.log('----end_date---------------------------', end_date)



            var _options = {
                'method': 'GET',

                'url': `https://ws-sandbox-api.eng.toasttab.com/orders/v2/ordersBulk?startDate=${start_date}T18:00:00.000-0000&endDate=${end_date}T18:00:00.000-0000`,
                'headers': {
                    'Toast-Restaurant-External-ID': restaurantId,
                    'Authorization': `Bearer ${TOKEN}`
                }
            };
            request(_options, function (error, response) {
                if (error) throw new Error(error);
                //console.log(response.body);
                let data = JSON.parse(response.body);
                data = data.map(x => {
                    let obj = {
                        orderId: x.guid,
                        voided: x.voided ? voided : true,
                        paymentMode: (x.checks[0] && x.checks[0].payments[0]?.type) ? x.checks[0].payments[0].type : null,
                        amount: x.checks[0] ? x.checks[0].amount : 0,
                        totalAmount: x.checks[0] ? x.checks[0].totalAmount : 0,
                        customer: x.checks[0] ? x.checks[0].customer : {},
                        serverId: x.server.guid,
                        discount: (x.checks[0] && x.checks[0].appliedDiscounts[0]?.discountAmount) ? x.checks[0].appliedDiscounts[0].discountAmount : null,
                        approver: (x.checks[0] && x.checks[0].appliedDiscounts[0]?.approver) ? x.checks[0].appliedDiscounts[0].approver : null
                    };
                    return obj;
                })
                let arr = []
                let totalDiscount = 0
                data.map((r) => {
                    if (r.voided) {
                        arr.push(r)
                        totalDiscount += r.totalAmount ? r.totalAmount : 0
                    }
                    // console.log('------data----', arr, ' -----------data----------')
                })

                var groupBy = function (xs, key) {
                    return xs.reduce(function (rv, x) {
                        (rv[x[key]] = rv[x[key]] || []).push(x);
                        return rv;
                    }, {});
                };
                var groubedByTeam = groupBy(arr, 'serverId')

                let allManager = [];
                Object.keys(groubedByTeam).forEach(function (key, index) {
                    let totalDiscount = 0;
                    groubedByTeam[key].map(e => {
                        totalDiscount += (e.amount) ? e.amount : 0;
                    });
                    let OBJ = {
                        totalDiscount: totalDiscount,
                        serverId: key,
                        name: 'ABC' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`
                    }
                    allManager.push(OBJ);
                });
                let managerDetail = allManager[0]
                start_date = moment(start_date).format('DD/MM/YYYY')
                return res.success({ start_date, totalDiscount, managerDetail, allManager }, 'Void fetched successfully !')
            });

        } catch (err) {
            console.log(err)
            return next(err);
        }
    }

    async managerVoid(req, res, next) {
        try {
            console.log('-----------------Manager Void------')
            let { restaurantId, serverId, filterValue } = req.query;
            let id = req.user._id;
            let restaurant = await Restaurant.findOne({ restaurantGuid: restaurantId, userId: id, isDeleted: false });
            if (!restaurant) {
                return res.warn('', 'Restaurant not found');
            }
            var options = {
                'method': 'POST',
                'url': 'https://ws-sandbox-api.eng.toasttab.com/authentication/v1/authentication/login',
                'headers': {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "clientId": CLIENT_ID,
                    "clientSecret": CLIENT_SECRET,
                    "userAccessType": USER_ACCESS_TYPE
                })
            };

            function doRequest(options) {
                return new Promise(function (resolve, reject) {
                    request(options, function (error, res, body) {
                        if (!error && res.statusCode === 200) {
                            resolve(body);
                        } else {
                            reject(error);
                        }
                    });
                });
            }

            let TOKEN_DATA = await doRequest(options);
            //  console.log(TOKEN_DATA);
            let TOKEN = JSON.parse(TOKEN_DATA).token.accessToken;

            // console.log("=====================token==========", TOKEN, " ========================");


            let currentDate = moment()
            let start_date = currentDate.add(-filterValue, 'days').format('YYYY-MM-DD')
            console.log('---start_date-----------------------------', start_date)
            let currentYear = new Date().getFullYear()
            let currentMonth = new Date().getMonth() + 1
            let currentDay = new Date().getDate()
            let end_date = `${currentYear}-${currentMonth}-${currentDay}`
            console.log('----end_date---------------------------', end_date)


            var _options = {
                'method': 'GET',

                'url': 'https://ws-sandbox-api.eng.toasttab.com/orders/v2/ordersBulk?startDate=2019-07-13T18:00:00.000-0000&endDate=2019-07-13T22:00:00.000-0000',
                'headers': {
                    'Toast-Restaurant-External-ID': restaurantId,
                    'Authorization': `Bearer ${TOKEN}`
                }
            };
            request(_options, function (error, response) {
                if (error) throw new Error(error);
                let data = JSON.parse(response.body);
                data = data.map(x => {
                    let obj = {
                        date: moment(x.createdDate).format('YYYY-MM-DD HH:mm:ss'),
                        orderId: x.guid,
                        voided: x.voided ? voided : true,
                        paymentMode: (x.checks[0].payments[0]?.type) ? x.checks[0].payments[0].type : null,
                        amount: x.checks[0].amount,
                        totalAmount: x.checks[0].totalAmount,
                        customer: x.checks[0].customer,
                        serverId: x.server.guid,
                        discount: (x.checks[0].appliedDiscounts[0]?.discountAmount) ? x.checks[0].appliedDiscounts[0].discountAmount : null,
                        approver: (x.checks[0].appliedDiscounts[0]?.approver) ? x.checks[0].appliedDiscounts[0].approver : null
                    };
                    return obj;
                })

                let arr = []

                data.map((r) => {
                    if (r.voided) {
                        arr.push(r)
                    }
                })

                var groupBy = function (xs, key) {
                    return xs.reduce(function (rv, x) {
                        (rv[x[key]] = rv[x[key]] || []).push(x);
                        return rv;
                    }, {});
                };
                var groubedByTeam = groupBy(arr, 'serverId')
                let totalDiscount = 0

                let r = [];
                Object.keys(groubedByTeam).forEach(function (key, index) {
                    if (key === serverId) {
                        r = groubedByTeam[key].map(e => {
                            totalDiscount += e.amount ? e.amount : 0
                            return {
                                date: e.date,
                                orderId: e.orderId,
                                customer: 'ABC' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`,
                                server: 'XYZ' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`,
                                Approver: 'MNO' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`,
                                discount: (e.amount) ? e.amount : 0
                            }
                        });
                    }
                });
                start_date = moment(start_date).format('DD/MM/YYYY')
                return res.success({ start_date, totalDiscount, r }, 'Restaurant void fetched successfully !')
            });

        } catch (err) {
            console.log(err)
            return next(err)
        }
    }

    async orderVoid(req, res, next) {
        try {
            console.log('-----------------Order Void-----------------')
            let { restaurantId, serverId, orderId, filterValue } = req.query;
            let id = req.user._id;
            let restaurant = await Restaurant.findOne({ restaurantGuid: restaurantId, userId: id, isDeleted: false });
            if (!restaurant) {
                return res.warn('', 'Restaurant not found');
            }
            var options = {
                'method': 'POST',
                'url': 'https://ws-sandbox-api.eng.toasttab.com/authentication/v1/authentication/login',
                'headers': {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "clientId": CLIENT_ID,
                    "clientSecret": CLIENT_SECRET,
                    "userAccessType": USER_ACCESS_TYPE
                })
            };

            function doRequest(options) {
                return new Promise(function (resolve, reject) {
                    request(options, function (error, res, body) {
                        if (!error && res.statusCode === 200) {
                            resolve(body);
                        } else {
                            reject(error);
                        }
                    });
                });
            }

            let TOKEN_DATA = await doRequest(options);
            let TOKEN = JSON.parse(TOKEN_DATA).token.accessToken;

            let currentDate = moment()
            let start_date = currentDate.add(-filterValue, 'days').format('YYYY-MM-DD')
            console.log('---start_date-----------------------------', start_date)
            let currentYear = new Date().getFullYear()
            let currentMonth = new Date().getMonth() + 1
            let currentDay = new Date().getDate()
            let end_date = `${currentYear}-${currentMonth}-${currentDay}`
            console.log('----end_date---------------------------', end_date)


            var _options = {
                'method': 'GET',
                'url': 'https://ws-sandbox-api.eng.toasttab.com/orders/v2/ordersBulk?startDate=2019-07-13T18:00:00.000-0000&endDate=2019-07-13T22:00:00.000-0000',
                'headers': {
                    'Toast-Restaurant-External-ID': restaurantId,
                    'Authorization': `Bearer ${TOKEN}`
                }
            };
            request(_options, function (error, response) {
                if (error) throw new Error(error);
                let data = JSON.parse(response.body);
                data = data.map(x => {
                    let obj = {
                        date: moment(x.createdDate).format('YYYY-MM-DD HH:mm:ss'),
                        orderId: x.guid,
                        voided: x.voided ? voided : true,
                        paymentMode: (x.checks[0].payments[0]?.type) ? x.checks[0].payments[0].type : null,
                        amount: x.checks[0].amount,
                        totalAmount: x.checks[0].totalAmount,
                        customer: x.checks[0].customer,
                        serverId: x.server.guid,
                        discount: (x.checks[0].appliedDiscounts[0]?.discountAmount) ? x.checks[0].appliedDiscounts[0].discountAmount : null,
                        approver: (x.checks[0].appliedDiscounts[0]?.approver) ? x.checks[0].appliedDiscounts[0].approver : null,
                        menuItem: (x.checks[0].selections[0]) ? x.checks[0].selections : null
                    };
                    return obj;
                })

                let arr = []
                let totalDiscount = 0
                data.map((r) => {
                    if (r.voided) {
                        arr.push(r)
                        totalDiscount += r.totalAmount ? r.totalAmount : 0
                    }
                })

                var groupBy = function (xs, key) {
                    return xs.reduce(function (rv, x) {
                        (rv[x[key]] = rv[x[key]] || []).push(x);
                        return rv;
                    }, {});
                };
                var groubedByTeam = groupBy(arr, 'serverId')
                let r;

                Object.keys(groubedByTeam).forEach(function (key, index) {
                    if (key === serverId) {
                        r = groubedByTeam[key].map(e => {
                            if (e.orderId === orderId) {
                                let items_ = []
                                e.menuItem.map((x) => {
                                    let obj = {
                                        displayName: x.displayName,
                                        price: x.price,
                                        date: x.createdDate,
                                    }

                                    items_.push(obj)
                                })
                                return {
                                    orderId: e.orderId,
                                    customer: 'ABC' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`,
                                    server: 'XYZ' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`,
                                    Approver: 'MNO' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`,
                                    // discount: (e.discount) ? e.discount : 0,
                                    menuItem: items_

                                }
                            }
                        })[0];
                    }
                });
                start_date = moment(start_date).format('DD/MM/YYYY')
                return res.success({ start_date, totalDiscount, r }, 'Restaurant void fetched successfully !')
            });

        } catch (err) {
            console.log(err)
            return next(err)
        }
    }

    async voidHighlight(req, res, next) {
        console.log('-----------------voidHighlight------')
        try {
            let { restaurantId, filterValue, discountThreshold } = req.query;
            let id = req.user._id;
            let restaurant = await Restaurant.findOne({ restaurantGuid: restaurantId, userId: id, isDeleted: false });
            let threshold = await Threshold.findOne({ slug:discountThreshold, restaurantId: restaurantId, userId: id, isDeleted: false });
            let _threshold=threshold?threshold.threshold:0;
            console.log('Threshold: ',threshold)
            if (!restaurant) {
                return res.warn('', 'Restaurant not found');
            }
            var options = {
                'method': 'POST',
                'url': 'https://ws-sandbox-api.eng.toasttab.com/authentication/v1/authentication/login',
                'headers': {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "clientId": CLIENT_ID,
                    "clientSecret": CLIENT_SECRET,
                    "userAccessType": USER_ACCESS_TYPE
                })
            };

            function doRequest(options) {
                return new Promise(function (resolve, reject) {
                    request(options, function (error, res, body) {
                        if (!error && res.statusCode === 200) {
                            resolve(body);
                        } else {
                            reject(error);
                        }
                    });
                });
            }

            let TOKEN_DATA = await doRequest(options);
            let TOKEN = JSON.parse(TOKEN_DATA).token.accessToken;

            // console.log("=====================token==========", TOKEN, " ========================");

            let currentDate = moment()
            let start_date = currentDate.add(-filterValue, 'days').format('YYYY-MM-DD')
            console.log('---start_date-----------------------------', start_date)
            let currentYear = new Date().getFullYear()
            let currentMonth = new Date().getMonth() + 1
            let currentDay = new Date().getDate()
            let end_date = `${currentYear}-${currentMonth}-${currentDay}`
            console.log('----end_date---------------------------', end_date)

            var _options = {
                'method': 'GET',

                'url': 'https://ws-sandbox-api.eng.toasttab.com/orders/v2/ordersBulk?startDate=2018-07-13T18:00:00.000-0000&endDate=2020-07-13T22:00:00.000-0000',
                'headers': {
                    'Toast-Restaurant-External-ID': restaurantId,
                    'Authorization': `Bearer ${TOKEN}`
                }
            };
            request(_options, function (error, response) {
                if (error) throw new Error(error);
                let data = JSON.parse(response.body);
                data = data.map(x => {
                    let obj = {
                        orderId: Math.floor(Math.random() * 10000),
                        voided: x.voided? voided : false,
                        paymentMode: (x.checks[0]?.payments[0]?.type) ? x.checks[0]?.payments[0]?.type : null,
                        amount: x.checks[0]?.amount?x.checks[0]?.amount:0,
                        totalAmount: x.checks[0]?.totalAmount?x.checks[0]?.totalAmount:0,
                        customer: x.checks[0]?.customer?x.checks[0]?.customer:null,
                        serverId: x.server.guid,
                        discount: (x.checks[0]?.appliedDiscounts[0]?.discountAmount) ? x.checks[0].appliedDiscounts[0].discountAmount : null,
                        approver: (x.checks[0]?.appliedDiscounts[0]?.approver) ? x.checks[0].appliedDiscounts[0].approver : null,
                        date: moment(x.createdDate).format('YYYY-MM-DD HH:mm:ss'),
                    };
                    return obj;
                })

                  data.map(e=>{
                                e.customer= 'ABC' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`;
                                e.server= 'XYZ' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`;
                                e.Approver= 'MNO' + `${Math.floor(Math.random() * 10)}` + `${Math.floor(Math.random() * 10)}`;
                                e.discount= (e.discount) ? e.discount : 0
                  })

                let totalVoid = 0;
               
                data.map((v) => {
                    if(v?.voided){
                        totalVoid += v?.amount ? v.amount : 1;
                        if (totalVoid<_threshold) discount.highlight=false;
                        else v.highlight=true;
                    }
                   
                });

               

                return res.success({ data,totalVoid,_threshold }, 'Restaurant discounts fetched successfully !')
            });


        } catch (err) {
            console.log(err)
            return next(err)
        }
    }


    //--------------------------------------------------------------- MORE API---------------------------------------------------------------------------

    async moreWeek(req, res, next) {
        try {
            console.log('-----------------More api weeks data ----------------')
            let { restaurantId, filterValue } = req.query;
            let id = req.user._id;
            let restaurant = await Restaurant.findOne({ restaurantGuid: restaurantId, userId: id, isDeleted: false });
            // console.log('-----filterValue------',filterValue,'---------')
            // console.log('-----filterValue Type------',typeof filterValue,'---------')
            if (!restaurant) {
                return res.warn('', 'Restaurant not found');
            }
            var options = {
                'method': 'POST',
                'url': 'https://ws-sandbox-api.eng.toasttab.com/authentication/v1/authentication/login',
                'headers': {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "clientId": CLIENT_ID,
                    "clientSecret": CLIENT_SECRET,
                    "userAccessType": USER_ACCESS_TYPE
                })
            };

            function doRequest(options) {
                return new Promise(function (resolve, reject) {
                    request(options, function (error, res, body) {
                        if (!error && res.statusCode === 200) {
                            resolve(body);
                        } else {
                            reject(error);
                        }
                    });
                });
            }

            let TOKEN_DATA = await doRequest(options);
            //  console.log(TOKEN_DATA);
            let TOKEN = JSON.parse(TOKEN_DATA).token.accessToken;

            ////  THIS CODE COMMENT BCZ PROPER DATA NOT FOUND, UNCOMMENT AFTER DATA FOUND 
            /*console.log("====================", TOKEN,"=============");
            let timeNow = new Date()
            let endDate = moment(filterValue).format('YYYY-MM-DD');
            let __date = new Date(endDate);
            let startDate = moment(`${__date.getFullYear() - 1}-11-01`).format('YYYY-MM-DD');
            let startDate = moment(endDate).subtract(1, 'year').format('YYYY-MM-DD')
            let endDate = moment(timeNow).format('YYYY-MM-DD')
            console.log("startDate:", startDate)
            console.log("endDate:", endDate)
            console.log(orderDetail.ArrOne)
            --------------------------- last week graph date-----------------------------------
            let lastWeekStrtDt = moment(startDate).subtract(7, 'days').format('YYYY-MM-DD')
            let lastWeekEndDt = endDate
            console.log("lastWeekStrtDt:", lastWeekStrtDt)
            console.log("lastWeekEndDt:", lastWeekEndDt)


            var _options = {
                'method': 'GET',

                'url': `https://ws-sandbox-api.eng.toasttab.com/orders/v2/ordersBulk?startDate=${startDate}T18:00:00.000-0000&endDate=${endDate}T18:00:00.000-0000`,
                'headers': {
                    'Toast-Restaurant-External-ID': restaurantId,
                    'Authorization': `Bearer ${TOKEN}`
                }
            };
            request(_options, function (error, response) {
                if (error) throw new Error(error);
                //console.log(response.body);
                let data = JSON.parse(response.body);
                data = data.map(x => {
                    let obj = {
                        M: new Date(x.createdDate).getMonth(),
                        Y:new Date(x.createdDate).getFullYear()
                    };
                    return obj;
                })
                return res.success({ data }, 'Restaurant order fetched successfully !')

            });*/


            // let D = 7;
            let D = new Date().getDay()
            // console.log('DDD',D)
            let _orders = weekOrderDetail.WeekDataArray;
            // console.log('-------order------', _orders)
            // console.log(M)
            var groupBy = function (xs, key) {
                // console.log('--xs--', xs)
                return xs.reduce(function (rv, x) {
                    (rv[x[key]] = rv[x[key]] || []).push(x);
                    return rv;
                }, {});
            };
            var groubedByTeam = groupBy(_orders, 'D');
            // console.log(groubedByTeam)
            let Arr = []
            for (var key of Object.keys(groubedByTeam)) {

                // console.log(groubedByTeam[key].length )
                let _obj = {
                    D: key,
                    orders: groubedByTeam[key].length
                }
                console.log(_obj)
                if (D >= Number(key)) Arr.push(_obj)
            }
            //groubedByTeam=groubedByTeam.map(x=>x.length)

            let YTD = [];

            var daysNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

            for (let i = 1; i < Arr.length; i++) {
                let _OBJ = {
                    D: daysNames[i - 1],
                    CurD: Arr[i].orders,
                    PrevD:Arr[i-1].orders
                }
                YTD.push(_OBJ)
            }

            return res.success({ YTD, precentage: 2 }, 'Restaurant order fetched successfully !')


        } catch (err) {
            console.log(err)
            return next(err)
        }
    }

    async moreYear(req, res, next) {
        try {
            console.log('-----------------More api year data ----------------')
            let { restaurantId, filterValue } = req.query;
            let id = req.user._id;
            let restaurant = await Restaurant.findOne({ restaurantGuid: restaurantId, userId: id, isDeleted: false });
            // console.log('-----filterValue------',filterValue,'---------')
            // console.log('-----filterValue Type------',typeof filterValue,'---------')
            if (!restaurant) {
                return res.warn('', 'Restaurant not found');
            }
            var options = {
                'method': 'POST',
                'url': 'https://ws-sandbox-api.eng.toasttab.com/authentication/v1/authentication/login',
                'headers': {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "clientId": CLIENT_ID,
                    "clientSecret": CLIENT_SECRET,
                    "userAccessType": USER_ACCESS_TYPE
                })
            };

            function doRequest(options) {
                return new Promise(function (resolve, reject) {
                    request(options, function (error, res, body) {
                        if (!error && res.statusCode === 200) {
                            resolve(body);
                        } else {
                            reject(error);
                        }
                    });
                });
            }

            let TOKEN_DATA = await doRequest(options);
            //  console.log(TOKEN_DATA);
            let TOKEN = JSON.parse(TOKEN_DATA).token.accessToken;

            ////  THIS CODE COMMENT BCZ PROPER DATA NOT FOUND, UNCOMMENT AFTER DATA FOUND 
            /*console.log("====================", TOKEN,"=============");
            let timeNow = new Date()
            let endDate = moment(filterValue).format('YYYY-MM-DD');
            let __date = new Date(endDate);
            let startDate = moment(`${__date.getFullYear() - 1}-11-01`).format('YYYY-MM-DD');
            let startDate = moment(endDate).subtract(1, 'year').format('YYYY-MM-DD')
            let endDate = moment(timeNow).format('YYYY-MM-DD')
            console.log("startDate:", startDate)
            console.log("endDate:", endDate)
            console.log(orderDetail.ArrOne)
            --------------------------- last week graph date-----------------------------------
            let lastWeekStrtDt = moment(startDate).subtract(7, 'days').format('YYYY-MM-DD')
            let lastWeekEndDt = endDate
            console.log("lastWeekStrtDt:", lastWeekStrtDt)
            console.log("lastWeekEndDt:", lastWeekEndDt)


            var _options = {
                'method': 'GET',

                'url': `https://ws-sandbox-api.eng.toasttab.com/orders/v2/ordersBulk?startDate=${startDate}T18:00:00.000-0000&endDate=${endDate}T18:00:00.000-0000`,
                'headers': {
                    'Toast-Restaurant-External-ID': restaurantId,
                    'Authorization': `Bearer ${TOKEN}`
                }
            };
            request(_options, function (error, response) {
                if (error) throw new Error(error);
                //console.log(response.body);
                let data = JSON.parse(response.body);
                data = data.map(x => {
                    let obj = {
                        M: new Date(x.createdDate).getMonth(),
                        Y:new Date(x.createdDate).getFullYear()
                    };
                    return obj;
                })
                return res.success({ data }, 'Restaurant order fetched successfully !')*/


            let M = 5;
            // let M = new Date().getMonth() + 1;

            let _orders = yearOrderDetail.yearDataArray;
            // console.log(M)
            var groupBy = function (xs, key) {
                return xs.reduce(function (rv, x) {
                    (rv[x[key]] = rv[x[key]] || []).push(x);
                    return rv;
                }, {});
            };
            var groubedByTeam = groupBy(_orders, 'M');
            // console.log(groubedByTeam)
            let Arr = []
            for (var key of Object.keys(groubedByTeam)) {

                // console.log(groubedByTeam[key].length )
                let _obj = {
                    M: key,
                    orders: groubedByTeam[key].length
                }
                console.log(_obj)
                if (M >= Number(key)) Arr.push(_obj)
            }
            //groubedByTeam=groubedByTeam.map(x=>x.length)

            let YTD = [];

            var monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];

            for (let i = 1; i < Arr.length; i++) {
                let _OBJ = {
                    M: monthNames[i - 1],
                    Y: new Date().getFullYear(),
                    PRCNT: Math.floor((Arr[i].orders - Arr[i - 1].orders) / (Arr[i].orders) * 100)
                }
                YTD.push(_OBJ)
            }

            return res.success({ YTD }, 'Restaurant order fetched successfully !')


        } catch (err) {
            console.log(err)
            return next(err)
        }
    }

    async moreWeekTotal(req, res, next) {
        try {
            console.log('-----------------moreWeekTotal ----------------')
            let { restaurantId, filterValue } = req.query;
            let id = req.user._id;
            // let restaurant = await Restaurant.findOne({ restaurantGuid: restaurantId, userId: id, isDeleted: false });
            // console.log('-----filterValue------',filterValue,'---------')
            // console.log('-----filterValue Type------',typeof filterValue,'---------')
            // if (!restaurant) {
            //     return res.warn('', 'Restaurant not found');
            // }
            var options = {
                'method': 'POST',
                'url': 'https://ws-sandbox-api.eng.toasttab.com/authentication/v1/authentication/login',
                'headers': {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "clientId": CLIENT_ID,
                    "clientSecret": CLIENT_SECRET,
                    "userAccessType": USER_ACCESS_TYPE
                })
            };

            function doRequest(options) {
                return new Promise(function (resolve, reject) {
                    request(options, function (error, res, body) {
                        if (!error && res.statusCode === 200) {
                            resolve(body);
                        } else {
                            reject(error);
                        }
                    });
                });
            }

            let TOKEN_DATA = await doRequest(options);
            //  console.log(TOKEN_DATA);
            let TOKEN = JSON.parse(TOKEN_DATA).token.accessToken;

            ////  THIS CODE COMMENT BCZ PROPER DATA NOT FOUND, UNCOMMENT AFTER DATA FOUND 
            /*console.log("====================", TOKEN,"=============");
            let timeNow = new Date()
            let endDate = moment(filterValue).format('YYYY-MM-DD');
            let __date = new Date(endDate);
            let startDate = moment(`${__date.getFullYear() - 1}-11-01`).format('YYYY-MM-DD');
            let startDate = moment(endDate).subtract(1, 'year').format('YYYY-MM-DD')
            let endDate = moment(timeNow).format('YYYY-MM-DD')
            console.log("startDate:", startDate)
            console.log("endDate:", endDate)
            console.log(orderDetail.ArrOne)
            --------------------------- last week graph date-----------------------------------
            let lastWeekStrtDt = moment(startDate).subtract(7, 'days').format('YYYY-MM-DD')
            let lastWeekEndDt = endDate
            console.log("lastWeekStrtDt:", lastWeekStrtDt)
            console.log("lastWeekEndDt:", lastWeekEndDt)


            var _options = {
                'method': 'GET',

                'url': `https://ws-sandbox-api.eng.toasttab.com/orders/v2/ordersBulk?startDate=${startDate}T18:00:00.000-0000&endDate=${endDate}T18:00:00.000-0000`,
                'headers': {
                    'Toast-Restaurant-External-ID': restaurantId,
                    'Authorization': `Bearer ${TOKEN}`
                }
            };
            request(_options, function (error, response) {
                if (error) throw new Error(error);
                //console.log(response.body);
                let data = JSON.parse(response.body);
                data = data.map(x => {
                    let obj = {
                        M: new Date(x.createdDate).getMonth(),
                        Y:new Date(x.createdDate).getFullYear()
                    };
                    return obj;
                })
                return res.success({ data }, 'Restaurant order fetched successfully !')

            });*/


            // let D = 7;
            let D = new Date().getDay()
            // console.log('DDD',D)
            let _orders = weekOrderDetail.WeekDataArray;
            // console.log('-------order------', _orders)
            // console.log(M)
            var groupBy = function (xs, key) {
                // console.log('--xs--', xs)
                return xs.reduce(function (rv, x) {
                    (rv[x[key]] = rv[x[key]] || []).push(x);
                    return rv;
                }, {});
            };
            var groubedByTeam = groupBy(_orders, 'D');
            // console.log(groubedByTeam)
            let Arr = []
            for (var key of Object.keys(groubedByTeam)) {

                // console.log(groubedByTeam[key].length )
                let _obj = {
                    D: key,
                    orders: groubedByTeam[key].length
                }
                console.log(_obj)
                if (D >= Number(key)) Arr.push(_obj)
            }
            //groubedByTeam=groubedByTeam.map(x=>x.length)

            let YTD = [];

            var daysNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

            for (let i = 1; i < Arr.length; i++) {
                let _OBJ = {
                    D: daysNames[i - 1],
                    CurD: Arr[i].orders,
                    PrevD:Arr[i-1].orders
                }
                YTD.push(_OBJ)
            }

            return res.success({ YTD, precentage: 2 }, 'Restaurant order fetched successfully !')


        } catch (err) {
            console.log(err)
            return next(err)
        }
    }
    async moreYearTotal(req, res, next) {
        try {
            console.log('-----------------moreYearTotal ----------------')
            let { restaurantId, filterValue } = req.query;
            let id = req.user._id;
            // let restaurant = await Restaurant.findOne({ restaurantGuid: restaurantId, userId: id, isDeleted: false });
            // console.log('-----filterValue------',filterValue,'---------')
            // console.log('-----filterValue Type------',typeof filterValue,'---------')
            // if (!restaurant) {
            //     return res.warn('', 'Restaurant not found');
            // }
            var options = {
                'method': 'POST',
                'url': 'https://ws-sandbox-api.eng.toasttab.com/authentication/v1/authentication/login',
                'headers': {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "clientId": CLIENT_ID,
                    "clientSecret": CLIENT_SECRET,
                    "userAccessType": USER_ACCESS_TYPE
                })
            };

            function doRequest(options) {
                return new Promise(function (resolve, reject) {
                    request(options, function (error, res, body) {
                        if (!error && res.statusCode === 200) {
                            resolve(body);
                        } else {
                            reject(error);
                        }
                    });
                });
            }

            let TOKEN_DATA = await doRequest(options);
            //  console.log(TOKEN_DATA);
            let TOKEN = JSON.parse(TOKEN_DATA).token.accessToken;

            ////  THIS CODE COMMENT BCZ PROPER DATA NOT FOUND, UNCOMMENT AFTER DATA FOUND 
            /*console.log("====================", TOKEN,"=============");
            let timeNow = new Date()
            let endDate = moment(filterValue).format('YYYY-MM-DD');
            let __date = new Date(endDate);
            let startDate = moment(`${__date.getFullYear() - 1}-11-01`).format('YYYY-MM-DD');
            let startDate = moment(endDate).subtract(1, 'year').format('YYYY-MM-DD')
            let endDate = moment(timeNow).format('YYYY-MM-DD')
            console.log("startDate:", startDate)
            console.log("endDate:", endDate)
            console.log(orderDetail.ArrOne)
            --------------------------- last week graph date-----------------------------------
            let lastWeekStrtDt = moment(startDate).subtract(7, 'days').format('YYYY-MM-DD')
            let lastWeekEndDt = endDate
            console.log("lastWeekStrtDt:", lastWeekStrtDt)
            console.log("lastWeekEndDt:", lastWeekEndDt)


            var _options = {
                'method': 'GET',

                'url': `https://ws-sandbox-api.eng.toasttab.com/orders/v2/ordersBulk?startDate=${startDate}T18:00:00.000-0000&endDate=${endDate}T18:00:00.000-0000`,
                'headers': {
                    'Toast-Restaurant-External-ID': restaurantId,
                    'Authorization': `Bearer ${TOKEN}`
                }
            };
            request(_options, function (error, response) {
                if (error) throw new Error(error);
                //console.log(response.body);
                let data = JSON.parse(response.body);
                data = data.map(x => {
                    let obj = {
                        M: new Date(x.createdDate).getMonth(),
                        Y:new Date(x.createdDate).getFullYear()
                    };
                    return obj;
                })
                return res.success({ data }, 'Restaurant order fetched successfully !')*/


                let M = 9;
                // let M = new Date().getMonth() + 1;
    
                let _orders = yearOrderDetail.yearDataArray;
                // console.log(M)
                var groupBy = function (xs, key) {
                    return xs.reduce(function (rv, x) {
                        (rv[x[key]] = rv[x[key]] || []).push(x);
                        return rv;
                    }, {});
                };
                var groubedByTeam = groupBy(_orders, 'M');
                // console.log(groubedByTeam)
                let Arr = []
                for (var key of Object.keys(groubedByTeam)) {
    
                    // console.log(groubedByTeam[key].length )
                    let _obj = {
                        M: key,
                        orders: groubedByTeam[key].length
                    }
                    console.log(_obj)
                    if (M >= Number(key)) Arr.push(_obj)
                }
                //groubedByTeam=groubedByTeam.map(x=>x.length)
    
                let YTD = [];
    
                var monthNames = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];
    
                for (let i = 1; i < Arr.length; i++) {
                    let _OBJ = {
                        M: monthNames[i - 1],
                        Y: new Date().getFullYear(),
                        PRCNT: Math.floor((Arr[i].orders - Arr[i - 1].orders) / (Arr[i].orders) * 100)
                    }
                    YTD.push(_OBJ)
                }
    
                return res.success({ YTD }, 'Restaurant order fetched successfully !')


        } catch (err) {
            console.log(err)
            return next(err)
        }
    }



    //--------------------------------------------------------------- TEST API---------------------------------------------------------------------------
    async test(req, res, next) {
        try {
            const array = ["page=4", "sortOrder=asc", "datePosted=all-time", "sortOrder=desc"];

            const match = array.find(value => /^sortOrder=/.test(value));


        } catch (err) {
            console.log(err)
            return next(err)
        }
    }
}





module.exports = new RestaurantController();

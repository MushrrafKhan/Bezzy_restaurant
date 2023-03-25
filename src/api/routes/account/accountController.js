const {
    models: { User, Restaurant, Account },
} = require('../../../../lib/models');
let multiparty = require('multiparty');
var mongoose = require('mongoose');
let _ = require('lodash');
const { showDate, uploadImageLocal, uploadImage } = require('../../../../lib/util');

class accountController {
    async addAccount(req, res, next) {
        try {
            console.log('-----------------add Account--------')
            let id = req.user._id;
            let restaurantId = req.body.restaurantId
            let user = await User.findOne({ _id: id, isDeleted: false });
            let accounts = req.body.accounts

            let accountSave = accounts.map(async x => {
                return await Account.updateOne(
                    {
                        accountId: x.accountId,
                        restaurantId: restaurantId,
                        userId: id
                    },
                    {
                        $setOnInsert: {accountId: x.accountId, restaurantId: restaurantId, userId: id }
                    },
                    { upsert: true }
                )
            })


            /*let accounts_ = await Account.find({ restaurantId: restaurantId, userId: id})
            // console.log('----acount----', accounts_)
            let arr = []
            if(accounts_.length > 0){
                accounts_.map(x=>{
                    arr.push(x.accountId.toString())
                })
            }
            // console.log('-----arr', arr)
            const newArr = []
            if (user) {
                accounts.forEach(x => {
                    if(arr.includes(x.accountId.toString())){
                        // console.log("------------if----")
                    }else{
                        // console.log('---else---')
                        newArr.push({ ...x, restaurantId: restaurantId, userId: id })
                    }
                });
                // console.log('-----',accounts,'-----')

                let accountSave = await Account.insertMany(newArr)*/

                return res.success(
                    {
                        accountSave
                    },
                    req.__('Account added successfully')
                )

            // } else {
            //     return res.warn('', 'User not found');
            // }
        } catch {
            console.log('---err---',err);
            return next(err);
        }
    }

    async accountList(req, res, next) {
        try {
            console.log('-----------------Account List--------')
            let id = req.user._id;
            let restaurantId = req.query.restaurantId;
            // console.log('restaurant---------- ', typeof restaurantId, restaurantId)
            let user = await User.findOne({ _id: id, isDeleted: false });

            if (!user) {
                return res.warn('', 'User not found');
            } else {
                let accounts = await Account.find({ restaurantId: restaurantId, userId: id})
                let allUser = await User.find({ isDeleted: false, _id: { $ne:id } })
                // console.log('-----------allUser----------------', allUser)
                // console.log(accounts)

                const accId = []
                accounts.map(x => {
                    accId.push(x.accountId.toString())
                })
                // console.log('----accId---', accId, '---------')

                const newUser = []
                allUser.map(x => {
                    // console.log(x._id)
                    if (accId.includes(x._id.toString())) {
                        // console.log('------if------1')
                    }else{
                        newUser.push(x)
                    }
                })

                let totolUser = newUser.length
                if (totolUser == 0) {
                    return res.success(
                        {
                            newUser,
                        },
                        req.__('Account not found')
                    );
                } else {
                    return res.success(
                        {
                            newUser,
                        },
                        req.__('Accounts feteched successfully')
                    );
                }
            }
        } catch {
            console.log(err);
            return next(err);
        }
    }

    async savedAcc(req, res, next) {
        try {
            console.log('-----------------Saved Account List--------')
            let id = req.user._id;
            let restaurantId = req.query.restaurantId;
            // console.log('----restaurant-id----',restaurantId)
            let user = await User.findOne({ _id: id, isDeleted: false });
            if (!user) {
                return res.warn('', 'User not found');
            } else {
                let accounts = await Account.find({userId: id, restaurantId:restaurantId}).populate({path:'accountId',select:'name position image -_id'});
                // console.log('----accoutn',accounts)
                if (accounts == '') {
                    return res.success(
                        {
                            accounts,
                        },
                        req.__('Accounts not found')
                    );
                } else {
                    return res.success(
                        {
                            accounts,
                        },
                        req.__('Accounts feteched successfully')
                    );
                }
            }
        } catch {
            console.log(err);
            return next(err);
        }
    }

    async editStaff(req, res, next) {
        try {
            let user = await User.findOne({ _id: req.user._id });
            let staffID = req.query.staffID;
            if (user) {
                let staffList = await Staff.findOne({ _id: staffID, isDeleted: false, userType:'staff' });
                if(!staffList){
                    return res.warn('', req.__('Staff not found'));
                }
                let form = new multiparty.Form();
                form.parse(req, async function(err, fields, files) {
                    _.forOwn(fields, (field, key) => {
                        staffList[key] = field[0];
                    });
                    try {
                        if (files.image !== undefined) {
                            let fileupload = files.image[0];
                            let image = await uploadImage(fileupload, 'staffList');
                            staffList.image = image.Key;
                        }
                        await staffList.save();
                        const staffJson = staffList.toJSON();

                        return res.success(
                            { 
                                language: req.headers['accept-language'],
                                staffList: staffJson
                            },
                            req.__('Staff Profile updated successfully')
                        );
                    } catch (err) {
                        console.log(err)
                        return next(err);
                    }
                });
            } else {
                return res.warn('', req.__('USER_NOT_FOUND'));
            }
        } catch (err) {
            console.log(err)
            return next(err);
        }
    }

    async deleteAccount(req, res, next) {
        try {
            console.log('-----------------Delete Account user--------')
            let id = req.user._id;
            let user = await User.findOne({ _id: id, isDeleted: false });
            let accountId = req.query.accountId;
            if (user) {
                // console.log(accountId)
                Account.findOneAndRemove({ _id: accountId})
                .then((user) => {
                    // console.log(user)
                    if (!user) {
                        // res.status(400).send( ' was not found');
                        return res.warn('', req.__('Account not found'));
                    } else {
                        res.status(200).send({
                            success: true,
                            message: 'Account deleted successfully'
                        });
                    }
                })
            } else {
                return res.warn('', 'User not found');
            }
        } catch {
            console.log(err);
            return next(err);
        }
    }

    async test(req, res, next) {
        try{
            let accounts = [
                {accountId: "6386e01493009204484873f1"},
                {accountId: "6386e01493009204484873f1"}
            ]
            accounts = { ...4, restaurantId: "restaurantId", userId: 'id' }
        
            console.log('----test------', accounts)




            return res.success({accounts},'test successfully')
        }catch(err){
            console.log(err)
            return next(err);
        }
    }
}

module.exports = new accountController();

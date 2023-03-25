const {
    models: { User, Route, AdminSetting, Payment, Subscription },
} = require('../../../../lib/models');
const _ = require('lodash');
const { uploadImage, generateResetToken } = require('../../../../lib/util');
const multiparty = require('multiparty');
var url = require('url');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class PaymentController {
    async listPage(req, res) {
        return res.render('payments/list');
    }

    async list(req, res) {
        //console.log("dfydydydy")
        let reqData = req.query;
        let columnNo = parseInt(reqData.order[0].column);
        let sortOrder = reqData.order[0].dir === 'desc' ? -1 : 1;
        let query = {
            isSubscribed: true,
        };

        if (reqData.search.value) {
            const searchValue = new RegExp(
                reqData.search.value
                    .split(' ')
                    .filter(val => val)
                    .map(value => value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
                    .join('|'),
                'i'
            );

            // query.$or = [
            //     {name: searchValue},
            //     {email: searchValue},
            // ];
        }
        let sortCond = { created: sortOrder };
        let response = {};
        switch (columnNo) {
            case 1:
                sortCond = {
                    name: sortOrder,
                };
                break;
            case 3:
                sortCond = {
                    status: sortOrder,
                };
                break;
            default:
                sortCond = { created: sortOrder };
                break;
        }

        const count = await User.countDocuments(query);
        console.log('=========' + count);
        response.draw = 0;
        if (reqData.draw) {
            response.draw = parseInt(reqData.draw) + 1;
        }
        response.recordsTotal = count;
        response.recordsFiltered = count;
        let skip = parseInt(reqData.start);
        let limit = parseInt(reqData.length);
        let users = await User.find(query)
            .sort(sortCond)
            .skip(skip)
            .limit(limit);

        if (users) {
            users = users.map(user => {
                // let actions = '';
                // actions = `${actions}<a href="/users/edit/${user._id}" title="Edit"><i class="fas fa-pen"></i></a>`;

                // actions = `${actions}<a href="/users/view/${user._id}" title="View"><i class="fas fa-eye"></i></a>`;
                // if (user.status) {
                //     actions = `${actions}<a class="statusChange" href="/users/update-status?id=${user._id}&status=false&" title="Activate"> <i class="fa fa-check"></i> </a>`;
                // } else {
                //     actions = `${actions}<a class="statusChange" href="/users/update-status?id=${user._id}&status=true&" title="Inactivate"> <i class="fa fa-ban"></i> </a>`;
                // }
                // actions = `${actions}<a class="deleteItem" href="/users/delete/${user._id}" title="Delete"> <i class="fas fa-trash"></i> </a>`;

                return {
                    0: (skip += 1),
                    1: user.name,
                    2: user.email,
                    3: user.subscriptionDate,
                };
            });
        }
        response.data = users;
        return res.send(response);
    }

    async premiumGet(req, res) {
        let premium = await Subscription.find({}).sort({ subscriptionDuration: 1 });
        console.log(premium);
        return res.render('payments/premium', { premium });
    }

    async premiumPost(req, res) {
        const { subscriptionDuration } = req.query;
        const { subscriptionId, subscriptionName, subscriptionPrice } = req.body;
        let sub = await Subscription.findOne({ subscriptionDuration: subscriptionDuration });
        const count = await Subscription.countDocuments({ subscriptionId: subscriptionId });

        if (count && !(sub.subscriptionId == subscriptionId)) {
            req.flash('error', req.__('Subscription ID already Exist'));
            return res.redirect(`/payments/premium`);
        }

        let test = await Subscription.findOneAndUpdate(
            { subscriptionDuration: subscriptionDuration },

            {
                subscriptionName: subscriptionName,
                subscriptionPrice: subscriptionPrice,
                subscriptionId: subscriptionId,
                slug: subscriptionId,
            },
            { new: true }
        );

        req.flash('success', req.__('Subscription Amount updated'));
        return res.redirect('/payments/premium');
    }
}
module.exports = new PaymentController();

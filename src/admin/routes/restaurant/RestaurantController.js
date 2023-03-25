const {
    models: { RestaurantUser },
} = require('../../../../lib/models');

const multer = require('multer');
const { showDate, uploadImageLocal, uploadImage } = require('../../../../lib/util');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
class RestaurantController {
    async listPage(req, res) {
        return res.render('restaurant/list');
    }
    async list(req, res) {
        let reqData = req.query;
        let columnNo = parseInt(reqData.order[0].column);
        let sortOrder = reqData.order[0].dir === 'desc' ? -1 : 1;
        let query = {
            isDeleted: false,
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
            query.$or = [{ name: searchValue }, { email: searchValue }];
        }
        let sortCond = { created: sortOrder };
        let response = {};
        switch (columnNo) {
            case 1:
                sortCond = {
                    name: sortOrder,
                };
                break;
            case 5:
                sortCond = {
                    status: sortOrder,
                };
                break;
            default:
                sortCond = { created: sortOrder };
                break;
        }
        const count = await RestaurantUser.countDocuments(query);
        response.draw = 0;
        if (reqData.draw) {
            response.draw = parseInt(reqData.draw) + 1;
        }
        response.recordsTotal = count;
        response.recordsFiltered = count;
        let skip = parseInt(reqData.start);
        let limit = parseInt(reqData.length);
        console.log('query====', query);
        console.log('sortCond=====', sortCond);
        let Restaurant = await RestaurantUser.find(query)
            .sort(sortCond)
            .skip(skip)
            .limit(limit);
        if (Restaurant) {
            Restaurant = Restaurant.map(restaurant => {
                let actions = '';
                actions = `${actions}<a href="/restaurant/view/${restaurant._id}" title="view"><i class="fas fa-eye"></i></a>`;
                if (restaurant.isSuspended) {
                    actions = `${actions}<a class="statusChange" href="/restaurant/update-status?id=${restaurant._id}&status=false&" title="Mark Active"> <i class="fa fa-ban"></i> </a>`;
                } else {
                    actions = `${actions}<a class="statusChange" href="/restaurant/update-status?id=${restaurant._id}&status=true&" title="Mark InActive"> <i class="fa fa-check"></i> </a>`;
                }
                actions = `${actions}<a class="deleteItem" href="/restaurant/delete/${restaurant._id}" title="Delete"> <i class="fas fa-trash"></i> </a>`;

                return {
                    0: (skip += 1),
                    1: restaurant.name,
                    2: restaurant.address,
                    3: `<span class="text131">${restaurant.description}</span>`,
                    4: restaurant.isSuspended
                        ? '<span class="badge label-table badge-danger">In-Active</span>'
                        : '<span class="badge label-table badge-success">Active</span>',
                    5: actions,
                };
            });
        }
        response.data = Restaurant;
        return res.send(response);
    }
    async Datainsert(req, res, next) {
        try {
            const upload = multer({
                dest: '/uploads',
            }).single('image');
            upload(req, res, async err => {
                if (err) {
                    res.send('Please select image.');
                }
                let file = req.file;
                let data = req.body;
                let image = await uploadImage(file, 'restaurentUser');
                unlinkAsync(file.path);
                let restuarantuser = new RestaurantUser();
                restuarantuser.name = data.name;
                restuarantuser.image = image.key;
                restuarantuser.address = data.address;
                restuarantuser.description = data.description;
                restuarantuser.save();
                return res.send({
                    message: 'data insert successfullys',
                });
            });
        } catch (err) {
            console.log('error', err);
            return next(err);
        }
    }
    async view(req, res) {
        let user = await RestaurantUser.findOne({
            _id: req.params.id,
            isDeleted: false,
        }).lean();
        console.log(user);
        if (!user) {
            req.flash('error', req.__('Restaurant user is not exists'));
            return res.redirect('/restaurant');
        }
        return res.render('restaurant/view', {
            user,
            url: `${process.env.AWS_BASE_URL}`,
        });
    }
    async updateStatus(req, res) {
        const { id, status } = req.query;
        let user = await RestaurantUser.findOne({
            _id: id,
            isDeleted: false,
        });
        if (!user) {
            req.flash('error', req.__('Restaurant user is not exists'));
            return res.redirect('/restaurant');
        }
        user.isSuspended = status;
        await user.save();
        req.flash('success', req.__('Restaurant user is updated'));
        return res.redirect('/restaurant');
    }
    async delete(req, res) {
        const user = await RestaurantUser.findOne({
            _id: req.params.id,
            isDeleted: false,
        });
        console.log(user);
        if (!user) {
            req.flash('error', req.__('Restaurant user is not exists'));
            return res.redirect('/restaurant');
        }
        user.isDeleted = true;
        await user.save();
        req.flash('success', req.__('Restaurant is deleted'));
        return res.redirect('/restaurant');
    }
}
module.exports = new RestaurantController();

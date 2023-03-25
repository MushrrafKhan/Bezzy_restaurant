require('dotenv').config();
const {
    models: { Category },
} = require('../../../../lib/models');

class CategoryController {
    async listPage(req, res) {
        return res.render('categories/list');
    }

    async list(req, res) {
        let reqData = req.query;
        let columnNo = parseInt(reqData.order[0].column);
        let sortOrder = reqData.order[0].dir === 'desc' ? -1 : 1;
        let query = {
            category: { $ne: null },
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

            query.$or = [{ category: searchValue }];
        }
        let sortCond = { created: sortOrder };
        let response = {};
        switch (columnNo) {
            case 1:
                sortCond = {
                    category: sortOrder,
                };
                break;
            default:
                sortCond = { created: sortOrder };
                break;
        }
        const count = await Category.countDocuments(query);
        response.draw = 0;
        if (reqData.draw) {
            response.draw = parseInt(reqData.draw) + 1;
        }
        response.recordsTotal = count;
        response.recordsFiltered = count;
        let skip = parseInt(reqData.start);
        let limit = parseInt(reqData.length);
        let categories = await Category.find(query)
            .sort(sortCond)
            .skip(skip)
            .limit(limit);
        if (categories) {
            categories = categories.map(cate => {
                let actions = '';
                actions = `${actions}<a href="/Categories/edit/${cate._id}" title="Edit"><i class="fas fa-pen"></i></a>`;

                if (cate.status) {
                    actions = `${actions}<a class="statusChange" href="/categories/update-status?id=${cate._id}&status=false&" title="Activate"> <i class="fa fa-check"></i> </a>`;
                } else {
                    actions = `${actions}<a class="statusChange" href="/categories/update-status?id=${cate._id}&status=true&" title="Inactivate"> <i class="fa fa-ban"></i> </a>`;
                }
                actions = `${actions}<a class="deleteItem" href="/categories/delete/${cate._id}" title="Delete"> <i class="fas fa-trash"></i> </a>`;

                return {
                    0: (skip += 1),
                    1: cate.category,
                    2:
                        cate.status == false
                            ? '<span class="badge label-table badge-danger">In-Active</span>'
                            : '<span class="badge label-table badge-success">Active</span>',
                    3: actions,
                };
            });
        }
        response.data = categories;
        return res.send(response);
    }

    async add(req, res) {
        return res.render('categories/add');
    }

    async addsave(req, res, next) {
        try {
           
            let { cate_name } = req.body;

            const count = await Category.countDocuments({category:cate_name});

            if(count){
                req.flash('error', req.__('Category name already exist'));
                return res.redirect('/categories/add');
            }

            let categorySave = new Category({
                category: cate_name,
            });
            await categorySave.save();
            req.flash('success', req.__('Category Added'));
            return res.redirect('/categories');
        } catch (err) {
            console.log(err);
            return res.next(err);
        }
    }

    async showedit(req, res) {
        const _id = req.params.id;
        const list = await Category.findOne({ _id });
        return res.render('categories/edit', {
            _id: list._id,
            category: list.category,
        });
    }

    async editsave(req, res) {
        try {
            let { cate } = req.body;
            let _id = req.params.id;

            let category = await Category.findOne({ _id });

            let query = {
                category :cate,
              };
            const count = await Category.countDocuments(query);
            console.log(count)

            if(count&&!(category.category==cate)){
                console.log(category._id)
                req.flash('error', req.__('category name already Exist'));
                return res.redirect(`/categories/edit/${category._id}`);
            }
            category.category = cate;
            await category.save();
            req.flash('success', req.__('Category Updated !'));
            return res.redirect('/categories');
        } catch (err) {
            console.log(err);
            return res.next(err);
        }
    } 

    async updateStatus(req, res) {
        const { id, status } = req.query;
        let categories = await Category.findOne({
            _id: id,
        });

        if (!categories) {
            req.flash('error', req.__('Category is not exists'));
            return res.redirect('/categories');
        }

        categories.status = status;
        await categories.save();

        req.flash('success', req.__('Category status updated'));
        return res.redirect('/categories');
    }

    async delete(req, res) {
        const category = await Category.findOne({
            _id: req.params.id,
            isDeleted: false,
        });

        if (!category) {
            req.flash('error', req.__('category is not exists !'));
            return res.redirect('/categories');
        }
        category.isDeleted = true;
        await category.save();

        req.flash('success', req.__('Category is deleted !'));
        return res.redirect('/categories');
    }
}

module.exports = new CategoryController();

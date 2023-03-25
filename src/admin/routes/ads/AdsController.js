require('dotenv').config();
const multiparty=require('multiparty');
const { models: {Ads} } = require('../../../../lib/models');
const users=require('../../../../lib/models/models/User.model');
const { showDate, uploadImageLocal, uploadImage } = require('../../../../lib/util');


class AdsController{

    async listPage(req, res) {
        console.log('--------listpage-------------')
        return res.render('ads/list');
    }

    async list(req, res) {
        console.log('---------req-------',req.query)
        let reqData = req.query;
        let columnNo = parseInt(reqData.order[0].column);
        let sortOrder = reqData.order[0].dir === 'desc' ? -1 : 1;
        let query = {
            title: { $ne: null },
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
            query.$or = [
                { title: searchValue }, 
            ];
        }
        let sortCond = { created: sortOrder };
        let response = {};
        switch (columnNo) {
            case 1:
                sortCond = {
                    title: sortOrder,
                };
                break;
            default:
                sortCond = { created: sortOrder };
                break;
        }
        const count = await Ads.countDocuments(query);
        response.draw = 0;
        if (reqData.draw) {
            response.draw = parseInt(reqData.draw) + 1;
        }
        response.recordsTotal = count;
        response.recordsFiltered = count;
        let skip = parseInt(reqData.start);
        let limit = parseInt(reqData.length);
        let ads = await Ads.find(query)
            .sort(sortCond)
            .skip(skip)
            .limit(limit);

        if (ads) {
            ads = ads.map(ad => {
                let actions = '';
                actions = `${actions}<a href="/ads/view/${ad._id}" title="view"><i class="fas fa-eye"></i></a>`;
                actions = `${actions}<a href="/ads/edit/${ad._id}" title="Edit"><i class="fas fa-pen"></i></a>`;

                if (ad.status) {
                    actions = `${actions}<a class="statusChange" href="/ads/update-status?id=${ad._id}&status=false&" title="Activate"> <i class="fa fa-check"></i> </a>`;
                } else {
                    actions = `${actions}<a class="statusChange" href="/ads/update-status?id=${ad._id}&status=true&" title="Inactivate"> <i class="fa fa-ban"></i> </a>`;
                }
                actions = `${actions}<a class="deleteItem" href="/ads/delete/${ad._id}" title="Delete"> <i class="fas fa-trash"></i> </a>`;

                return {
                    0: (skip += 1),
                    1: ad.title,
                    2: ad.setDefault==false ?'<i class="icofont-location-pin style="font-size:20px""></i>':'<i class="icofont-location-pin text-success p-2" style="font-size:20px"></i>',
                    3: ad.status == false ? '<span class="badge label-table badge-danger">In-Active</span>' : '<span class="badge label-table badge-success">Active</span>',
                    4: actions
                };
            });
        }
        response.data = ads;
        return res.send(response);
    }

    async add(req,res,next){
        try{
            return res.render('ads/add');
        }catch(err){
            console.log(err);
            return res.next(err);
        }
    }
    async addSave(req,res,next){
        
        let ads = {};
        let coordinates = {};
        let locals = [];
        let form = new multiparty.Form();
        form.parse(req, async function(err, fields, files) {
            let fileupload = files.image[0];
            _.forOwn(fields, (field, key) => {
                if (key == 'lat' || key == 'lng') {
                    coordinates[key] = field[0];
                }
                ads[key] = field[0];
            });
            try {
                let image = await uploadImage(fileupload, 'ads');
                ads['image'] = image.Key;
               
                locals.push(coordinates['lat']);
                locals.push(coordinates['lng']);
                ads.loc = {
                    type: 'Point',
                    coordinates: locals,
                };
                await new Ads(ads).save();
                req.flash('success', req.__('Ads added success !'));
                return res.redirect('/ads');
            } catch (err) {
                console.log(err);
                return next(err);
            }
        });

       
    }

    async editPage(req,res,next){
        try{
            let _id=req.params.id;
            let adsValue=await Ads.findOne({_id});
            let img = `${process.env.AWS_BASE_URL}`;
            return res.render('ads/edit',{
                adsValue,
                img
            });
        }catch(err){
            console.log(err);
            return res.next(err);
        }
    }

    async editSave(req,res,next){
       
        let _id=req.params.id;
        let ads =await Ads.findOne({_id});
        let coordinates = {};
        let locals = [];
        let form = new multiparty.Form();
        form.parse(req, async function(err, fields, files) {
                let newImage = false;
                let fileupload = files.image[0];
                if (fileupload.size > 0) {
                    newImage = true;
                }
                console.log(fields)
            _.forOwn(fields, (field, key) => {
                if (key == 'lat' || key == 'lng') {
                    coordinates[key] = field[0];
                }
                
                ads[key] = field[0];
            });
            try {
                if (newImage) {
                let image = await uploadImage(fileupload, 'ads');
                ads['image'] = image.Key;
                }
                locals.push(coordinates['lat']);
                locals.push(coordinates['lng']);
                ads.loc = {
                    type: 'Point',
                    coordinates: locals,
                };
                let setDefault=false;
                if(fields.setDefault=='on'){
                     setDefault=true;
                }else{
                     setDefault=false;
                }
                ads.setDefault=setDefault;
                console.log(ads);
                await ads.save();
                req.flash('success', req.__('Ads updated success success !'));
                return res.redirect('/ads');
            } catch (err) {
                console.log(err);
                return next(err);
            }
        });
    }

    async view(req,res){
        const _id=req.params.id;
        const data=await Ads.findOne({_id});
        let img = `${process.env.AWS_BASE_URL}`;
        
        return res.render('ads/view',{
            data,
            img
        });
    }


    async updateStatus(req, res) {
        const {id, status} = req.query;
        let ads = await Ads.findOne({
            _id: id
        });

        if (!ads) {
            req.flash('error', req.__('Ads is not exists'));
            return res.redirect('/ads');
        }

        ads.status = status;
        await ads.save();

        req.flash('success', req.__('Ads status is updated'));
        return res.redirect('/ads');
    }

    async delete(req, res) {
        const ads = await Ads.findOne({
            _id: req.params.id,
            isDeleted: false
        });

        if (!ads) {
            req.flash('error', req.__('Ads is not exists'));
            return res.redirect('/ads');
        }
        ads.isDeleted = true;
        await ads.save();

        req.flash('success', req.__('Ads status is deleted'));
        return res.redirect('/ads');
    }


}

module.exports = new AdsController();
require('dotenv').config();
const path=require('path');
const {
    models: { User, Live,Category },
} = require('../../../../lib/models');
const fs=require('fs');
const aws = require('aws-sdk');
const s3 = new aws.S3();
const ext = '.mp4'
const { showDate, uploadImageLocal, uploadImage } = require('../../../../lib/util');
const multiparty = require('multiparty');
class VideoController {
    async listPage(req, res) {
       return res.render('videos/list')
    }
    async list(req,res){
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
        const count = await Live.countDocuments(query);
        response.draw = 0;
        if (reqData.draw) {
            response.draw = parseInt(reqData.draw) + 1;
        }
        response.recordsTotal = count;
        response.recordsFiltered = count;
        let skip = parseInt(reqData.start);
        let limit = parseInt(reqData.length);
        let vid = await Live.find(query)
        .populate({path:'user_id',select:'name image -_id'})
        .populate({path:'category',select:'category -_id',model:Category})
            .sort(sortCond)
            .skip(skip)
            .limit(limit);
        console.log(vid);
        if (vid) {
            vid = vid.map(vdo => {
                let actions = '';
                actions = `${actions}<a href="/videos/view/${vdo._id}" title="view"><i class="icofont-ui-play"></i></a>`;
                actions = `${actions}<a class="deleteItem" href="/videos/delete/${vdo._id}" title="Delete"> <i class="fas fa-trash"></i> </a>`;
                return {
                    0: (skip += 1),
                    1: vdo.title,
                    2: vdo.user_id.name,
                    3:vdo.category.category,
                    4: actions
                    
                };
            });
        }
        response.data = vid;
        return res.send(response);
    }
    async view(req,res){
        let _id=req.params.id;
        let vdo=await Live.findOne({_id})
        .populate({path:'user_id',select:'name avatar -_id'});
        let img = `${process.env.AWS_BASE_URL}`;
        
        return res.render('videos/view',{
            vdo,
            img
        });
    }
    async downloads(req,res){
        let _id=req.body.id;
        let vdo=await Live.findOne({_id});
        const params = {
            Bucket: process.env.AWS_S3_BUCKET, 
            Key: vdo.live_video 
          };
          let downloadPath=path.join(__dirname,`../../../../../../../download/${vdo.title}`+ext)
          return s3.getObject(params, (err, data) => {
            if (err) console.error(err);
            fs.writeFileSync(downloadPath, data.Body);
            res.download(downloadPath, function (err) {
              if (err) {
                console.log(res.headersSent)
              } 
            })
           return res.success('true');
          });   
    }
    async add(req,res,next){
        return res.render('videos/add');
    }
    async save_add(req,res,next){
        let live = {};
        let coordinates = {};
        let locals = [];
        let form = new multiparty.Form();
        form.parse(req, async function(err, fields, files) {
            console.log(fields)
            let fileupload = files.live_video[0];
            _.forOwn(fields, (field, key) => {
                if (key == 'lat' || key == 'lng') {
                    coordinates[key] = field[0];
                }
                live[key] = field[0];
            });
            try {
                let image = await uploadImage(fileupload, 'video');
                live['live_video'] = image.Key;
                locals.push(coordinates['lat']);
                locals.push(coordinates['lng']);
                live.loc = {
                    type: 'Point',
                    coordinates: locals,
                };
                await new Live(live).save();
                req.flash('success', req.__('Video added success !'));
                return res.redirect('/videos/');
            } catch (err) {
                return next(err);
            }
        });
    }

    async delete(req, res) {
        const lives = await Live.findOne({
            _id: req.params.id,
            isDeleted: false
        });

        if (!lives) {
            req.flash('error', req.__('Video is not Exists'));
            return res.redirect('/videos');
        }
        lives.isDeleted = true;
        await lives.save();

        req.flash('success', req.__('Video is deleted !'));
        return res.redirect('/videos');
    }

}

module.exports = new VideoController();
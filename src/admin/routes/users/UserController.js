require('dotenv').config();
const { models: {User} } = require('../../../../lib/models');
const path=require('path');
const { showDate, uploadImageLocal, uploadImage } = require('../../../../lib/util');
const uploadshow=`${process.env.SITE_URL}/uploads/`;
const upload=path.join(__dirname,'../../static/uploads');
const fs = require('fs');
const multer=require('multer');
const multiparty = require('multiparty');


const storage = multer.diskStorage({
    destination : (req,file,cb)=>cb(null,upload),

    filename: (req,file,cb)=>{
        const uniqueName = `${Date.now()}-${Math.round(Math.random()* 1E9)}${path.extname(file.originalname)}`;
        cb(null,uniqueName);
    }
})

const handleMultipartData = multer({
    storage:storage,
    limits:{fieldSize : 1000000*10}
}).single('image');


class UserController {
    async listPage(req, res) {
        return res.render('users/list');
    }

    async addUserPage(req, res) { 
        return res.render("users/add");
    }

    async editUserPage(req, res) {
        let _id = req.params.id;
        let userdata = await User.findOne({_id:_id});
   
        // console.log(userdata.name);
        return res.render('users/edit',{
            userdata:userdata
        })

    }
    async updateData(req,res){
        let data = req.body;
        let _id = req.params.id;
        let user = await User.findOne({_id:_id});
        user.name = data.name;
        user.email = data.email;
        await user.save();
        return res.redirect('/users');

        
    }
    
   
    async addUserSave(req, res, next) {
        let user = {};
        let form = new multiparty.Form();
        form.parse(req, async function(err, fields, files) {
            let fileupload = files.image[0];
            _.forOwn(fields, (field, key) => {   
                user[key] = field[0];
            });
            try {
                let image = await uploadImage(fileupload, 'user');
                user['avatar'] = image.Key;
                await new User(user).save();
                console.log(user);
                req.flash('success', req.__('User added success !'));
                return res.redirect('/users');
            } catch (err) {
                return next(err);
            }
        });
    }

    async list(req, res) {
        
        let reqData = req.query;
        let columnNo = parseInt(reqData.order[0].column);
        let sortOrder = reqData.order[0].dir === 'desc' ? -1 : 1;
        let query = {
            name:{$ne:null},
            email:{$ne:null},
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
                {name: searchValue},
                {email: searchValue},
                {countryCode: searchValue},
                {mobile: searchValue},
            ];
        }
        let sortCond = {created: sortOrder};
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
            sortCond = {created: sortOrder};
            break;
        }

        const count = await User.countDocuments(query);
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
                let actions = '';
                actions = `${actions}<a href="/users/edit/${user._id}" title="Edit"><i class="fas fa-pen"></i></a>`;

                actions = `${actions}<a href="/users/view/${user._id}" title="View"><i class="fas fa-eye"></i></a>`;
                if (user.status) {
                    actions = `${actions}<a class="statusChange" href="/users/update-status?id=${user._id}&status=false&" title="Activate"> <i class="fa fa-check"></i> </a>`;
                } else {
                    actions = `${actions}<a class="statusChange" href="/users/update-status?id=${user._id}&status=true&" title="Inactivate"> <i class="fa fa-ban"></i> </a>`;
                }
                actions = `${actions}<a class="deleteItem" href="/users/delete/${user._id}" title="Delete"> <i class="fas fa-trash"></i> </a>`;

                return {
                    0: (skip += 1),
                    1: user.name,
                    2: user.email,
                    3: user.status==false ? '<span class="badge label-table badge-danger">In-Active</span>' : '<span class="badge label-table badge-success">Active</span>',
                    4: actions,
                };
            });
        }
        response.data = users;
        return res.send(response);
    }

    async view(req, res) {
        let user = await User.findOne({
            _id: req.params.id,
            isDeleted: false
        }).lean();

        if (!user) {
            req.flash('error', req.__('USER_NOT_EXISTS'));
            return res.redirect('/users');
        }
        let img=process.env.AWS_BASE_URL;
        console.log(img)
        return res.render('users/view', {
            user,
            img
        });
    }

    async updateStatus(req, res) {
        const {id, status} = req.query;
        let user = await User.findOne({
            _id: id,
            // status: false
        });

        if (!user) {
            req.flash('error', req.__('USER_NOT_EXISTS'));
            return res.redirect('/users');
        }

        user.status = status;
        await user.save();

        req.flash('success', req.__('USER_STATUS_UPDATED'));
        return res.redirect('/users');
    }

    async uploadProfilePic(req, res){
        
        let userId = req.params.id;
        let form = new multiparty.Form();
        
        form.parse(req, async function(err, fields, file) {
            
            let fileName = file['file'][0].originalFilename;

            let extension = fileName.substr( (fileName.lastIndexOf('.') +1) );
            fileName = userId + '.' + extension;

            let tmp_path = file['file'][0].path;
            let target_path = `${process.env.UPLOAD_IMAGE_PATH}` + 'users/' + fileName;
            try{
                
                let image = await uploadImageLocal(tmp_path,target_path,fileName);
                
                let user = await User.findOne({
                    _id: userId,
                    isDeleted: false
                });
                user.avatar = fileName;
                await user.save();
                req.flash('success', "Profile image successfully uploaded!");
                return res.success({'status':'success','image':image});

            }catch( err ){
                return res.success({'status':'fail'});
            }
          
          }); 
        
    }

    async delete(req, res) {
        const user = await User.findOne({
            _id: req.params.id,
            isDeleted: false
        });

        if (!user) {
            req.flash('error', req.__('USER_NOT_EXISTS'));
            return res.redirect('/users');
        }
        user.isDeleted = true;
        await user.save();

        req.flash('success', req.__('USER_DELETE_SUCCESS'));
        return res.redirect('/users');
    }

    async isEmailExists(req, res) {
        const { email } = req.body;

        const count = await User.countDocuments({email: email});

        return res.success(count);
    }

    
}

module.exports = new UserController();
const {
    models: { User, Subscription}
} = require('../../../../lib/models');


class SubController {

    async subAll(req,res,next ){
        try{
            let id = req.user._id;
            let user = await User.findOne({
                _id:id,
                isDeleted: false,
            })
            if (!user) {
                return res.notFound('', req.__('USER_NOT_FOUND'));
            }


            // let allAlerts = await Alert.find();
            //     return res.success({
            //         allAlerts: allAlerts
            //     }, req.__('ALL_ALERTS'));


            let subs = await Subscription.find()
            console.log(subs)
            return res.success(subs,'All subscription list')
        } catch(err){
            console.log(err);
            return next(err)
        }
    }

    async saveSub(req, res, next){
        try{
            let subscriptionId = req.body.subscriptionId
            let id = req.user._id;
            console.log(req.body)
            let user = await User.findOne({
                _id:id,
                isDeleted: false,
            })
            console.log('==========sub=========')
            console.log(user)
            if(!user){
                return res.notFound('', req.__('USER_NOT_FOUND'))
            }
            user.isSubscribed = true,
            user.subscriptionDate = new Date()
            user.subscriptionId = subscriptionId
        
            let newUser = await user.save()
            console.log(newUser)
            res.success(newUser,  "Subscription add successfully")
        }catch(err){
            return next(err)
        }
    }
}


module.exports = new SubController();

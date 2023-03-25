const {
    models: {Page, Welcome}
} = require('../../../../lib/models');
const {showDate, uploadImageLocal} = require('../../../../lib/util');
require('../../../../lib/models')

class staticController{
    async firstContent(req,res,next){
            const content = await Welcome.findOne({slug:"first-content"});
            // console.log(content.content)
            // console.log('--------------------')
            res.render("welcome/firstContent",{content});
    }

    async secondContent(req,res,next){
        // console.log('---------second--------')
        const content = await Welcome.findOne({slug:"second-content"});
        // console.log(content)
        res.render("welcome/secondContent",{content});       
    }
    async thirdContent(req,res,next){
        // console.log('--------third-------')
        const content = await Welcome.findOne({slug:"third-content"});
        // console.log(content)
        res.render("welcome/thirdContent",{content});       
    }

    async cmsdata(req,res,next){
        // console.log()
            const id = req.params.id;
            let originalString = req.body.content;
            // console.log(originalString)
            // let strippedString = originalString.replace(/(<([^>]+)>)/gi, "");
            const content = await Welcome.findOneAndUpdate({_id:req.params.id},{content:originalString},{new:true}); 
                       
            if(content.slug == "first-content"){
                return res.render("welcome/firstContent",{content})         
            }else if(content.slug == "second-content"){
                res.render("welcome/secondContent",{content});         
            }
            else if(content.slug == "third-content"){
                res.render("welcome/thirdContent",{content});         
            }
    }
}

module.exports = new staticController;
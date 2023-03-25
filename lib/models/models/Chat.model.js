const mongoose = require('mongoose');
   const Schema = mongoose.Schema;

const Chat = new Schema(
    {
        userId:{
            type: Schema.Types.ObjectId,
            ref: 'User'  
        },
        videoId:{
            type: Schema.Types.ObjectId,
            ref: 'Live'  
        },
        msg: {
            type: String
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    }
);



const data = mongoose.model('chat', Chat);
module.exports = data;
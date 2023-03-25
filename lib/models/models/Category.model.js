const mongoose = require('mongoose');
   const Schema = mongoose.Schema;

const CategorySchema = new Schema(
    {
        category:{
            type: String,
               
        },
        status: {
            type: Boolean,
            default: true,
        },
        isDeleted: {
            type: Boolean,
            default: false
        }
    }
);



const data = mongoose.model('category', CategorySchema);
module.exports = data;
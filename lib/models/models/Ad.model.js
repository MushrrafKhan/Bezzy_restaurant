const mongoose = require('mongoose');
   const Schema = mongoose.Schema;

const AdsSchema = new Schema(
    {
        title:{
           type:String,
           required:true     
        },
        image: {
            type: String,
            //required: true,
        },
        adurls:{
            type:String,
            
        },
        image:{
            type:String,
        },
        status: {
            type: Boolean,
            default: true,
        },
        setDefault:{
            type:Boolean,
            default:false
        },
        loc: {
            type: { type: String, default: 'Point' },
            coordinates: [{
                type: Number
            }]
        },
        radius:{
            type: Number,
            required: true
        },
       
        isDeleted: {
            type: Boolean,
            default: false
        },
    },
    {
        timestamps: {
            createdAt: 'created',
            updatedAt: 'updated'
        },
        id: false,
        toJSON: {
            getters: true
        },
        toObject: {
            getters: true
        },
    }
);

module.exports = mongoose.model('ad', AdsSchema);

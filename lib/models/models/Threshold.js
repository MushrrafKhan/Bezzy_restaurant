const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt');

const DiscountsSchema = new Schema(
    {
        
        title: {
            type: String,
            trim: true,
        },
        slug: {
            type: String,
        },
        threshold: {
            type: Number,
        },
        restaurantId:{
            type:String
        },
        userId:{
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        isSuspended: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: {
            createdAt: 'created',
            updatedAt: 'updated',
        },
        id: false,
        toJSON: {
            getters: true,
        },
        toObject: {
            getters: true,
        },
    }
);

module.exports = mongoose.model('Threshold', DiscountsSchema);

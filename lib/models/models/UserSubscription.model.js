const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const UserSubscription = new Schema(
    {
        subscriptionName: {
            type: String,
            trim: true,
            required: true,
        },
        subscriptionId: {
            type: String,
            trim: true,
            required: true,
        },
        subscriptionPrice: {
            type: Number,
            required: true,
            default: true
        },
        subscriptionDuration: {
            type: Number,
        },
        user:{
            type: Schema.Types.ObjectId,      
            ref: 'User',
            required: true                 
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

module.exports = mongoose.model('UserSubscription', UserSubscription);
const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const Subscription = new Schema(
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
        slug: {
            type: String
        },
        subscriptionDuration: {
            type: Number,
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

module.exports = mongoose.model('Subscription', Subscription);
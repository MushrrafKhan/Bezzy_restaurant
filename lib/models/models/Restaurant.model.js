const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt');

const RestaurantUserSchema = new Schema(
    {
        restaurantGuid:{
            type: String,
            trim: true,
            default: '', 
        },
        managementGroupGuid:{
            type: String,
            trim: true,
            default: '', 
        },
        restaurantName:{
            type: String,
            trim: true,
            default: '', 
        },
        locationName: {
            type: String,
            default: ''
        },
        createdByEmailAddress: {
            type: String,
            default: ''
        },
        externalGroupRef: {
            type: String,
            default: ''
        },
        externalRestaurantRef: {
            type: String,
            default: ''
        },
        modifiedDate: {
            type: String,
            default: ''
        },
        createdDate: {
            type: String,
            default: ''
        },
        isoModifiedDate: {
            type: String,
            default: ''
        },
        isoCreatedDate: {
            type: String,
            default: ''
        },
        distance: {
            type: Number,
            default: 0
        },
        image: {
            type: String,
            trim: true,
            default: '',
        },
        description: {
            type: String,
            trim: true,
        },
        isSuspended: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        userId:{
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
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

module.exports = mongoose.model('RestaurantUser', RestaurantUserSchema);

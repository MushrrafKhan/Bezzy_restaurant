const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt');

const EventsSchema = new Schema(
    {
        eventTitle:{
            type: String,
            trim: true,
            default: '', 
        },
        eventName:{
            type: String,
            trim: true,
            default: '', 
        },
        timeFormat: {
            type: String,
            enum:['AM', 'PM']   
        },
        restaurantId:{
            type: String,
            trim: true,
            default: '', 
        },
        userId:{
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        time: {
            type: String,
            trim: true,
            default: '',
        },
        eventDate: {
            type:String,
            required: true
        },
        additionalNotes: {
            type: String,
            trim: true,
            default: '', 
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

module.exports = mongoose.model('Events', EventsSchema);

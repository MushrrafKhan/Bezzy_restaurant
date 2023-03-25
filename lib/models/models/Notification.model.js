const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const NotificationSchema = new Schema(
    {
        eventName:{
            type:String
        },
        eventTitle:{
            type:String
        },
        additionalNotes:{
            type:String
        },
        restaurantId:{
            type:String
        },
        userId: {
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

module.exports = mongoose.model('Notification', NotificationSchema);

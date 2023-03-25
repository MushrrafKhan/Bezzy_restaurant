const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const Welcome = new Schema(
    {
        content: {
            type: String,
            trim: true,
            required: true,
        },
        slug: {
            type: String
        }
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

module.exports = mongoose.model('Welcome', Welcome);
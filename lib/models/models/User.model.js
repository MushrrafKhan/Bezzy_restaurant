const mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt');

const UserSchema = new Schema(
    {
        name: {
            type: String,
            //required: true,
            trim: true,
            default: '',
        },
        position: {
            type: String,
            default: '',
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            //required: true,
        },
        mobileNumber: {
            type: String,
            default: '',
        },
        password: {
            type: String,
            //required: true,
        },
        image: {
            type: String,
            trim: true,
            default: '',
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deviceToken: {
            type: String,
            trim: true,
        },
        deviceType: {
            type: String,
            trim: true,
        },
        deviceId: [
            {
                type: String,
            },
        ],
        emailVerify: {
            type: Boolean,
            default: false,
        },
        isLogin: {
            type: Boolean,
            default: false,
        },
        otp: {
            type: String,
            default: '',
        },
        socialType: {
            type: String,
            default: '',
        },
        socialId: {
            type: String,
            default: '',
        },
        progress: {         // for signup multiple stage (screen)
            type: Number,
            default: 0,
        },
        isSuspended: {
            type: Boolean,
            default: false,
        },
        notification: {
            type: Boolean,
            default: false,
        },
        location: {
            type: Boolean,
            default: false,
        },
        media: {
            type: Boolean,
            default: false,
        },
        loc: {
            type: { type: String, default: 'Point' },
            coordinates: [
                {
                    type: Number,
                },
            ],
        },
        isSubscribed: {
            type: Boolean,
            default: false,
        },
        subscriptionDate: {
            type: Date,
        },
        subscriptionId: {
            type: Number,
        },

        authTokenIssuedAt: Number,

        emailToken: {       // for signup
            type: String,
            default: '',
        },
        resetToken: {       // for forgot password
            type: String,
            default: '',
        },
        // role:{
        //     type: String,
        //     default:'user'    //admin, user, practice, buyinggroup, vendor
        // },

        // location: {
        //     type: Boolean,
        //     default: false
        // },

        // country: {
        //     type: String,
        //     //required: true,
        //     trim: true,
        // },

        // dob: {
        //     type: Date
        // },

        // gender: {
        //     type: String,
        //     trim: true
        // },
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

UserSchema.pre('save', async function(next) {
    const user = this;

    if (!user.isModified('password')) return next();
    try {
        const saltRounds = parseInt(process.env.BCRYPT_ITERATIONS, 10) || 10;
        user.password = await bcrypt.hash(user.password, saltRounds);
        next();
    } catch (e) {
        next(e);
    }
});

UserSchema.methods.comparePassword = async function(password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (e) {
        return false;
    }
};

module.exports = mongoose.model('User', UserSchema);

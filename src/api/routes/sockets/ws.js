const {
    models: {
        User,
        Category,
        LikeDislike,
        GroupSwap,
        Notification,
        InvitedUser,
        Friend,
        AdminSettings,
        GroupSwaplike,
        GroupChat,
        Setting,
        Chat
    },
} = require('../../../../lib/models');
const moment = require('moment');
const mongoose = require('mongoose');

const { showDate, uploadImageLocal, uploadImage } = require('../../../../lib/util');
const fs = require('fs');
const multiparty = require('multiparty');
var FCM = require('fcm-node');
const async = require('async');
const objectId = require('../../../../lib/util/index');

const users = [];

// Join user to chat
function userJoin(id, user_id, video_id, online) {
    const user = { id, user_id, video_id, online };

    users.push(user);

    return user;
}

let sendMessage = async (viId, user, data) => {
    try {
        //  console.log("enter")
        //   let groupId = mongoose.Types.ObjectId(gpId);
        // let friendId = mongoose.Types.ObjectId(user);
        let videoId = viId;
        let userId = user;
        let msg = data.msg;

        // let {groupId,message}  = req.body;
        // let friendId=req.user._id;
        let savemessage = new Chat({
            videoId,
            userId,
            msg,
        });
        let response = await savemessage.save();

        let msgData = await Chat.find({ videoId }).populate({
            path: 'userId',
            select: 'image name',
            model: User,
        }).sort({_id:-1}).limit(1);

        // console.log("okkkkks"+msgData)
        return msgData;
    } catch (err) {
        console.log(err);
    }
};

let sendMessageImage = async (gpId, user, msg) => {
    try {
        //  console.log("enter")
        //   let groupId = mongoose.Types.ObjectId(gpId);
        // let friendId = mongoose.Types.ObjectId(user);
        let roomId = gpId;
        let friendId = user;
        let message = msg;

        // let {groupId,message}  = req.body;
        // let friendId=req.user._id;

        let imageData = msg;

        let image = await uploadImageBase64(imageData, 'chat');

        let savemessage = new GroupChat({
            roomId,
            friendId,
            message: image.Key,
        });
        let response = await savemessage.save();

        let msgData = await GroupChat.find({ roomId }).populate({
            path: 'friendId',
            select: 'image name',
            model: User,
        });

        // console.log("okkkkks"+msgData)
        return msgData;
    } catch (err) {
        console.log(err);
    }
};

let getgroupMsg = async groupId => {
    try {
    } catch (err) {
        console.log(err);
    }
};

function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

function getRoomUsers(room) {
    return users.filter(user => user.video_id === room);
}

function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

module.exports = {
    sendMessage,
    getgroupMsg,
    userJoin,
    getCurrentUser,
    getRoomUsers,
    userLeave,
};

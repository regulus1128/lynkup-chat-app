import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "group",
    },
    text: {
        type: String,
    },
    image: {
        type: String,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    isSystem: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const Message = mongoose.model('message', messageSchema);

export default Message;
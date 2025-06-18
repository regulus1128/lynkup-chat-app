import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    groupAvatar: {
        type: String,
        default: "/group2.png",
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    }],
}, { timestamps: true });

const Group = mongoose.model("group", groupSchema);

export default Group;
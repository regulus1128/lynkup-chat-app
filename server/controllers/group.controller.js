import Group from "../models/group.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io } from "../lib/socket.js";
import User from "../models/user.model.js";

export const createGroup = async (req, res) => {
    const { name, groupAvatar, members } = req.body;
    const creatorId = req.user._id;

    if(!name){
        return res.status(400).json({ message: "Group name is required" });
    }

    if (!Array.isArray(members) || members.length === 0) {
        return res.status(400).json({ message: "At least one member is required" });
      }

    try {
        const uniqueMembers = Array.from(new Set([...members, creatorId.toString()]));

        const newGroup = new Group({
            name,
            groupAvatar,
            createdBy: creatorId,
            members: uniqueMembers,
        });

        const savedGroup = await newGroup.save();
        res.status(201).json(savedGroup);
    } catch (error) {
        console.error("Error creating group:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const addGroupMembers = async (req, res) => {
    const { groupId } = req.params;
    const { newMembers } = req.body; // array of user IDs
    const requesterId = req.user._id;
  
    if (!Array.isArray(newMembers) || newMembers.length === 0) {
      return res.status(400).json({ message: "No members provided" });
    }
  
    try {
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found" });
  
      if (group.createdBy.toString() !== requesterId.toString()) {
        return res.status(403).json({ message: "Only the group creator can add members" });
      }
  
      // Add only new members that aren't already in the group
      const updatedMembers = Array.from(new Set([...group.members.map(id => id.toString()), ...newMembers]));
  
      group.members = updatedMembers;
      await group.save();

      // Fetch names of new members
const newMemberUsers = await User.find({
  _id: { $in: newMembers },
}, "fullName");

const names = newMemberUsers.map(u => u.fullName);

let text = "";

if (names.length === 1) {
  text = `${names[0]} has joined the group.`;
} else if (names.length === 2) {
  text = `${names[0]} and ${names[1]} have joined the group.`;
} else if (names.length === 3) {
  text = `${names[0]}, ${names[1]} and ${names[2]} have joined the group.`;
} else {
  text = `${names.slice(0, 2).join(", ")} and ${names.length - 2} others have joined the group.`;
}

const systemMessage = new Message({
  senderId: process.env.SYSTEM_USER_ID,
  groupId,
  text,
  isSystem: true,
});



      await systemMessage.save();
      io.to(groupId).emit("newMessage", systemMessage);
      

      
  
      res.status(200).json({ message: "Members added successfully", group });
    } catch (error) {
      console.error("Error adding members:", error);
      res.status(500).json({ message: "Internal server error" });
    }
};

  
export const deleteGroup = async (req, res) => {
    const { groupId } = req.params;
    const requesterId = req.user._id;
  
    try {
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found" });
  
      if (group.createdBy.toString() !== requesterId.toString()) {
        return res.status(403).json({ message: "Only the group creator can delete this group" });
      }
  
      await Group.findByIdAndDelete(groupId);
      res.status(200).json({ success: true, message: "Group deleted successfully" });
    } catch (error) {
      console.error("Error deleting group:", error);
      res.status(500).json({ message: "Internal server error" });
    }
};

  
export const leaveGroup = async (req, res) => {
    const { groupId } = req.params;
    const userId = req.user._id;
  
    try {
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found" });
  
      // Prevent group creator from leaving (unless delete feature is used)
      if (group.createdBy.toString() === userId.toString()) {
        return res.status(403).json({ message: "Group creator cannot leave the group. Delete it instead." });
      }
  
      const isMember = group.members.includes(userId);
      if (!isMember) {
        return res.status(400).json({ message: "You are not a member of this group" });
      }
  
      group.members = group.members.filter(
        (memberId) => memberId.toString() !== userId.toString()
      );

      const user = await User.findById(userId); // for the name

const systemMessage = new Message({
  senderId: process.env.SYSTEM_USER_ID,
  groupId,
  text: `${user.fullName} has left the group.`,
  isSystem: true,
});
await systemMessage.save();
io.to(groupId).emit("newMessage", systemMessage);

  
      await group.save();
  
      res.status(200).json({ success: true, message: "You have left the group", group });
    } catch (error) {
      console.error("Error leaving group:", error);
      res.status(500).json({ message: "Internal server error" });
    }
};

  
export const getUserGroups = async (req, res) => {
    const userId = req.user._id;
  
    try {
      const groups = await Group.find({
        members: userId,
      }).populate("createdBy", "fullName profilePic") // optional
        .populate("members", "fullName profilePic")    // optional
        .sort({ updatedAt: -1 }); // latest first
  
      res.status(200).json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Internal server error" });
    }
};


export const getGroupMessages = async (req, res) => {
  const { groupId } = req.params;

  try {
    const messages = await Message.find({ groupId })
      .populate("senderId", "fullName profilePic")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching group messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export const sendGroupMessage = async (req, res) => {
  const { groupId } = req.params;
  const { text, image } = req.body;
  const senderId = req.user._id;

  if (!text) {
    return res.status(400).json({ message: "Message content is required." });
  }

  let imageUrl;

  if(image){
    const uploadResponse = await cloudinary.uploader.upload(image);
    imageUrl = uploadResponse.secure_url;
}


  try {
    // Check if group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Optional: ensure sender is a member of the group
    if (!group.members.includes(senderId)) {
      return res.status(403).json({ message: "You are not a member of this group." });
    }

    const newMessage = new Message({
      senderId,
      groupId,
      text,
      image: imageUrl,
    });

    const savedMessage = await newMessage.save();

    const populatedMessage = await savedMessage.populate("senderId", "fullName profilePic");

    // const io = req.app.get("io");
    io.to(groupId).emit("newMessage", populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending group message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate("createdBy", "fullName profilePic")
      .populate("members", "fullName profilePic");
    if (!group) return res.status(404).json({ message: "Group not found" });

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ message: "Error fetching group" });
  }
};


export const editGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { groupPic, groupName } = req.body;

    let groupPicUrl;
    if(groupPic){
      const uploadResponse = await cloudinary.uploader.upload(groupPic);
      groupPicUrl = uploadResponse.secure_url;
    }

    const updatedFields = {
      name: groupName,
    }

    if(groupPicUrl){
      updatedFields.groupAvatar = groupPicUrl;
    }

    const updatedGroup = await Group.findByIdAndUpdate(groupId, updatedFields, { new: true });

    res.status(200).json({ success: true, message: "Group details updated successfully!", updatedGroup });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
}
  
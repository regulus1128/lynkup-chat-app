import { Server } from "socket.io";
import http from "http";
import express from 'express';
import Message from "../models/message.model.js";
import Group from "../models/group.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["https://lynkup-zeta.vercel.app"],
        credentials: true,
    },
});

const onlineUsers = new Map();
const userSocketMap = {};

const lastTypingStatus = {};

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}


io.on("connection", async (socket) => {
    const userId = socket.handshake.query.userId;

    try {
      const userGroups = await Group.find({ members: userId }, "_id");
      userGroups.forEach(group => {
        socket.join(group._id.toString());
        // console.log(`User ${userId} joined group room ${group._id}`);
      });
    } catch (err) {
      console.error("Failed to join group rooms:", err);
    }

    onlineUsers.set(socket.id, userId); // Store userId with socket id
    userSocketMap[userId] = socket.id;
    socket.userId = userId; // Store userId in socket object



    // const onlineUserIds = Array.from(new Set(onlineUsers.values()));
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    io.emit("newUserJoined", { userId });


    socket.on("disconnect", () => {
        // console.log(`User disconnected: ${userId}`);
        
        // Clean up user data
        onlineUsers.delete(socket.id);
        delete userSocketMap[userId];
        
        // Remove typing status records
        Object.keys(lastTypingStatus).forEach(key => {
            if (key.startsWith(`${userId}-`)) {
                delete lastTypingStatus[key];
            }
        });
        
        // Broadcast updated online users list
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });

    socket.on("markAsRead", async ({ senderId, groupId }) => {
        const receiverId = socket.userId;

        if(groupId){
          await Message.updateMany({
            groupId,
            isRead: false,
            senderId: { $ne: receiverId }
          },
          { $set: { isRead: true } });

          io.to(groupId).emit("messagesRead", {
            groupId,
            receiverId,
          });
        } else if(senderId){
          await Message.updateMany(
            { senderId: senderId, receiverId: receiverId, isRead: false },
            { $set: { isRead: true } }
          );
        }
      
      
        // Notify sender that messages were read
        const senderSocketId = userSocketMap[senderId];
        if (senderSocketId) {
          io.to(senderSocketId).emit("messagesRead", {
            readerId: receiverId,
          });
        }
      });

    socket.on('sendMessage', async (messageData) => {
        try {
          const { receiverId, text, image, groupId } = messageData;
      
          const newMessage = await Message.create({
            senderId: userId,
            receiverId: groupId ? undefined : receiverId,
            groupId: groupId || undefined,
            text,
            image,
          });
      
          const populatedMessage = await newMessage.populate("senderId", "fullName profilePic");
      
          if (groupId) {
            // Send to all group members except sender
            const group = await Group.findById(groupId);
            if (!group) return;
      
            group.members.forEach((memberId) => {
              if (memberId.toString() !== userId.toString()) {
                const memberSocketId = userSocketMap[memberId.toString()];
                if (memberSocketId) {
                  io.to(memberSocketId).emit('newMessage', populatedMessage);
                }
              }
            });
          } else {
            // 1-on-1 chat
            const recipientSocketId = getReceiverSocketId(receiverId);
            if (recipientSocketId) {
              io.to(recipientSocketId).emit('newMessage', populatedMessage);
            }
          }
      
          // Send back to sender as well
          socket.emit('newMessage', populatedMessage);
      
        } catch (error) {
          console.error('Error sending message:', error);
        }
      });
      

      socket.on("typing", async ({ receiverId, groupId }) => {
        const targetKey = groupId || receiverId;
        const targetType = groupId ? "group" : "user";
      
        if (!targetKey) return;
      
        const now = Date.now();
        const key = `${userId}-${targetType}-${targetKey}`;
        if (!lastTypingStatus[key] || now - lastTypingStatus[key] > 2000) {
          lastTypingStatus[key] = now;
      
          if (targetType === "user") {
            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
              io.to(receiverSocketId).emit("typing", { senderId: userId });
            }
          } else {
            // broadcast to all group members
            const group = await Group.findById(groupId).populate("members");
            group.members.forEach((member) => {
              if (member._id.toString() !== userId.toString()) {
                const memberSocketId = getReceiverSocketId(member._id);
                if (memberSocketId) {
                  io.to(memberSocketId).emit("typing", { senderId: userId, groupId });
                }
              }
            });
          }
        }
      });
      
      

      socket.on("stopTyping", async ({ receiverId, groupId }) => {
        if (groupId) {
          const key = `${userId}-group-${groupId}`;
          lastTypingStatus[key] = 0;
      
          const group = await Group.findById(groupId).populate("members");
          // groupMap[groupId] = group;
      
          group.members.forEach(member => {
            const memberId = member._id.toString();
            if (memberId !== userId) {
              const socketId = userSocketMap[memberId];
              if (socketId) {
                io.to(socketId).emit("stopTyping", { senderId: userId, groupId });
              }
            }
          });
      
          // console.log(`User ${userId} stopped typing in group ${groupId}`);
      
        } else if (receiverId) {
          const key = `${userId}-${receiverId}`;
          lastTypingStatus[key] = 0;
      
          const recipientSocketId = getReceiverSocketId(receiverId);
          if (recipientSocketId) {
            io.to(recipientSocketId).emit("stopTyping", { senderId: userId });
          }
      
          // console.log(`User ${userId} stopped typing to ${receiverId}`);
        }
      });
      

    
});



export { io, app, server };
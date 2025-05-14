import { Server } from "socket.io";
import http from "http";
import express from 'express';
import Message from "../models/message.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        credentials: true,
    },
});

const onlineUsers = new Map();
const userSocketMap = {};

const lastTypingStatus = {};

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}


io.on("connection", (socket) => {
    // console.log("A user connected", socket.id);
    const userId = socket.handshake.query.userId;

    onlineUsers.set(socket.id, userId); // Store userId with socket id
    userSocketMap[userId] = socket.id;
    socket.userId = userId; // Store userId in socket object



    // const onlineUserIds = Array.from(new Set(onlineUsers.values()));
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    io.emit("newUserJoined", { userId });


    socket.on("disconnect", () => {
        console.log(`User disconnected: ${userId}`);
        
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

    socket.on("markAsRead", async ({ senderId }) => {
        const receiverId = socket.userId;
      
        // Update messages in DB
        await Message.updateMany(
          { senderId: senderId, receiverId: receiverId, isRead: false },
          { $set: { isRead: true } }
        );
      
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
            const { receiverId, text } = messageData;
            
            // Find the socket ID of the recipient
            const recipientSocketId = getReceiverSocketId(receiverId);
            
            // Create a new message object
            const newMessage = {
                senderId: userId,
                receiverId,
                text,
                image,
                createdAt: new Date(),
                _id: Math.random().toString(36).substring(2) + Date.now().toString(36)
            };
            
            // Send to recipient if online
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('newMessage', newMessage);
            }
            
            // Send back to sender to update their UI
            socket.emit('newMessage', newMessage);

            if (recipientSocketId) {
                io.to(recipientSocketId).emit('stopTyping', { senderId: userId });
            }
            
        } catch (error) {
            console.error('Error sending message:', error);
        }
    });

    socket.on("typing", ({ receiverId }) => {
        if (!receiverId) return;
        
        const now = Date.now();
        const key = `${userId}-${receiverId}`;
        
        // Only send typing notification if enough time has passed since last one
        if (!lastTypingStatus[key] || now - lastTypingStatus[key] > 2000) {
            lastTypingStatus[key] = now;
            
            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("typing", { senderId: userId });
                console.log(`User ${userId} is typing to ${receiverId}`);
            }
        }
    });

    socket.on('stopTyping', ({ receiverId }) => {
        if (!receiverId) return;
        
        const key = `${userId}-${receiverId}`;
        lastTypingStatus[key] = 0; // Reset typing status
        
        const recipientSocketId = getReceiverSocketId(receiverId);
        if (recipientSocketId) {
            io.to(recipientSocketId).emit('stopTyping', { senderId: userId });
            console.log(`User ${userId} stopped typing to ${receiverId}`);
        }
    });
});



export { io, app, server };
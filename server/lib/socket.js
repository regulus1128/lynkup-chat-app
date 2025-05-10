import { Server } from "socket.io";
import http from "http";
import express from 'express';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173"],
        credentials: true,
    },
});

export function getReceiverSocketId(userId) {
    return userSocketMap[userId];
}

// store online users here
const userSocketMap = {};

io.on("connection", (socket) => {
    // console.log("A user connected", socket.id);
    const userId = socket.handshake.query.userId;

    if(userId){
        userSocketMap[userId] = socket.id;
        socket.userId = userId; // Store userId in socket object
        console.log(`✅ User ${userId} connected as socket ${socket.id}`);
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));


    socket.on("disconnect", () => {
    // console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });

    socket.on("typing", ({ receiverId }) => {
        const receiverSocketId = getReceiverSocketId(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("typing", { senderId: socket.userId });
        }
        // console.log(`User ${socket.userId} is typing to ${receiverId}`);
    })
});



export { io, app, server };
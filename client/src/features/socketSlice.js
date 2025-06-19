import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { io } from "socket.io-client";
import { addMessage, getUsers, markMessagesAsRead, setTyping } from "./chatSlice";

const BASE_URL = import.meta.env.VITE_BASE_URL;
let socket = null;
const eventTimers = {};

// Helper function to debounce socket events
const debounceEvent = (eventName, callback, delay = 300) => {
  if (eventTimers[eventName]) {
    clearTimeout(eventTimers[eventName]);
  }
  eventTimers[eventName] = setTimeout(() => {
    callback();
    delete eventTimers[eventName];
  }, delay);
};

export const connectSocket = createAsyncThunk(
  'socket/connectSocket',
  async (_, { getState, dispatch }) => {
    const { authUser } = getState().auth;
    if (!authUser || !authUser._id) return null;
    
    // Disconnect existing socket if there is one
    if (socket && socket.connected) {
      socket.disconnect();
    }

    // Create new socket connection
    socket = io(BASE_URL, {
      query: { userId: authUser._id },
      withCredentials: true,
    });

    // Return a Promise that resolves after the socket connects
    return new Promise((resolve) => {
      socket.on('connect', () => {
        console.log('✅ Socket connected with ID:', socket.id, 'User:', authUser._id);

        socket.on("newUserJoined", () => {
          dispatch(getUsers());
        });

        // Register all listeners here
        socket.on('getOnlineUsers', (userIds) => {
          // console.log("✅ Online users updated:", userIds);
          dispatch(setOnlineUsers(userIds));
        });

        socket.on('newMessage', (newMessage) => {
          const { selectedUser, messages } = getState().chat;
          const { authUser } = getState().auth;
        
          // Check if message already exists to prevent duplicates
          const messageExists = messages.some(msg => {
            // Compare by temporary ID, actual ID, or content + timestamp
            return msg._id === newMessage._id || 
                   (msg.tempId && msg.tempId === newMessage.tempId) ||
                   (msg.text === newMessage.text && 
                    Math.abs(new Date(msg.createdAt) - new Date(newMessage.createdAt)) < 1000);
          });

          // Only add message if it doesn't already exist and it's not from the current user
          // (current user's messages are already added via sendMessage.fulfilled)
          const senderId = typeof newMessage.senderId === 'object' ? newMessage.senderId._id : newMessage.senderId;
          const isFromCurrentUser = senderId === authUser._id;
          
          if (!messageExists && !isFromCurrentUser) {
            dispatch(addMessage(newMessage));
          }
        
          // Handle unread message notifications
          if (newMessage.groupId) {
            if (!selectedUser || selectedUser._id !== newMessage.groupId) {
              dispatch(incrementUnreadMessage(newMessage.groupId));
              dispatch(setNewMessageFrom(newMessage.groupId));
            }
          } else {
            if (!selectedUser || selectedUser._id !== senderId) {
              dispatch(incrementUnreadMessage(senderId));
              dispatch(setNewMessageFrom(senderId));
            }
          }
        });
        
        // Fixed typing handlers
        socket.on('typing', ({ senderId, groupId }) => {
          const { selectedUser } = getState().chat;
          
          if (groupId && selectedUser && selectedUser._id === groupId) {
            dispatch(setTyping({ targetId: groupId, isTyping: true }));
          } else if (!groupId && selectedUser && senderId === selectedUser._id) {
            dispatch(setTyping({ targetId: senderId, isTyping: true }));
          }
        });

        socket.on('stopTyping', ({ senderId, groupId }) => {
          const { selectedUser } = getState().chat;
          
          if (groupId && selectedUser && selectedUser._id === groupId) {
            dispatch(setTyping({ targetId: groupId, isTyping: false }));
          } else if (!groupId && selectedUser && senderId === selectedUser._id) {
            dispatch(setTyping({ targetId: senderId, isTyping: false }));
          }
        });

        socket.on("messagesRead", (data) => {
          dispatch(markMessagesAsRead(data)); 
        });

        resolve(socket.id); // Return socket ID after connected
      });

      socket.on('connect_error', (err) => {
        console.error("❌ Socket connect error:", err.message);
        resolve(null); // Still resolve to prevent hanging thunk
      });
    });
  }
);
  
export const disconnectSocket = createAsyncThunk(
    'socket/disconnectSocket',
    async () => {
      if (socket && socket.connected) {
        socket.disconnect();
        return true;
      }
      return false;
    }
  );

const typingTimeouts = {};

// Fixed typing status function
export const sendTypingStatus = (isTyping, { receiverId = null, groupId = null }) => {
  if (!socket || !socket.connected) return;
  
  const event = isTyping ? 'typing' : 'stopTyping';
  const timeoutKey = `${event}-${receiverId || groupId}`;
  const target = groupId ? { groupId } : { receiverId };
  
  // Clear existing timeout to debounce
  if (typingTimeouts[timeoutKey]) {
    clearTimeout(typingTimeouts[timeoutKey]);
  }
  
  // Set a new timeout
  typingTimeouts[timeoutKey] = setTimeout(() => {
    socket.emit(event, target);
    delete typingTimeouts[timeoutKey];
  }, isTyping ? 100 : 300); // Faster for typing, slower for stopTyping
};

export const clearUnreadMessages = createAsyncThunk(
  'socket/clearUnreadMessages',
  async (userId, { dispatch }) => {
    dispatch(clearUserUnreadMessages(userId));
    return userId;
  }
);

export const emitMessage = ({ text, image = "", groupId = null, receiverId = null }) => {
  if (!socket || !socket.connected) return;

  socket.emit("sendMessage", {
    text,
    image,
    groupId,
    receiverId,
  });
};

const socketSlice = createSlice({
  name: 'socket',
  initialState: {
    socketId: null,
    onlineUsers: [],
    typingUsers: [],
    unreadMessages: {},
    newMessageFrom: null,
  },
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setSocket: (state, action) => {
      state.socketId = action.payload;
    },
    setNewMessageFrom: (state, action) => {
      state.newMessageFrom = action.payload;
    },
    addTypingUser: (state, action) => {
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload);
      }
    },
    removeTypingUser: (state, action) => {
      state.typingUsers = state.typingUsers.filter(userId => userId !== action.payload);
    },
    clearUserUnreadMessages: (state, action) => {
      const userId = action.payload;
      if (state.unreadMessages[userId]) {
        state.unreadMessages[userId] = 0;
      }
    },
    incrementUnreadMessage: (state, action) => {
      const userId = action.payload;
      if (!state.unreadMessages[userId]) {
        state.unreadMessages[userId] = 1;
      } else {
        state.unreadMessages[userId] += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectSocket.fulfilled, (state, action) => {
        state.socketId = action.payload || null;
      })
      .addCase(disconnectSocket.fulfilled, (state) => {
        state.socketId = null;
        state.onlineUsers = [];
      });
  },
});

export const { setOnlineUsers, setSocket, setNewMessageFrom, addTypingUser, removeTypingUser, clearUserUnreadMessages, incrementUnreadMessage } = socketSlice.actions;
export { socket };
export default socketSlice.reducer;
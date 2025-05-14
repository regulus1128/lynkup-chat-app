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
    if (!authUser) return null;
    
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
        // console.log('✅ Connected to server with ID:', socket.id);

        socket.on("newUserJoined", () => {
          dispatch(getUsers());
        });

        // Register all listeners here
        socket.on('getOnlineUsers', (userIds) => {
          // console.log("✅ Online users updated:", userIds);
          dispatch(setOnlineUsers(userIds));
        });

        socket.on('newMessage', (newMessage) => {
          // console.log("✅ Received newMessage:", newMessage);
          const { selectedUser } = getState().chat;
          
          // Add the message regardless of selected user
          dispatch(addMessage(newMessage));

          if(!selectedUser || selectedUser._id !== newMessage.senderId) {
            dispatch(incrementUnreadMessage(newMessage.senderId));
            dispatch(setNewMessageFrom(newMessage.senderId));
          }
        });

        socket.on('typing', ({ senderId }) => {
          // Debounce the typing event to prevent rapid re-renders
          debounceEvent(`typing-${senderId}`, () => {
            console.log("✅ User typing:", senderId);
            dispatch(addTypingUser(senderId));
            
            const selectedUser = getState().chat.selectedUser;
            if (selectedUser && senderId === selectedUser._id) {
              dispatch(setTyping(true));
            }
          }, 100);
        });

        socket.on('stopTyping', ({ senderId }) => {
          // Debounce the stopTyping event
          debounceEvent(`stopTyping-${senderId}`, () => {
            // console.log("✅ User stopped typing:", senderId);
            
            // Remove from global typing users list
            dispatch(removeTypingUser(senderId));
            
            // If this is the selected user, also update the chat typing indicator
            const selectedUser = getState().chat.selectedUser;
            if (selectedUser && senderId === selectedUser._id) {
              dispatch(setTyping(false));
            }
          }, 100);
        });

        socket.on("messagesRead", ({ readerId }) => {
          dispatch(markMessagesAsRead(readerId)); 
        });
        

        socket.onAny((event, ...args) => {
          console.log(`🔔 Event received: ${event}`, args);
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

export const sendTypingStatus = (isTyping, receiverId) => {
  if (!socket || !socket.connected || !receiverId) return;
  
  const event = isTyping ? 'typing' : 'stopTyping';
  const timeoutKey = `${event}-${receiverId}`;
  
  // Clear existing timeout to debounce
  if (typingTimeouts[timeoutKey]) {
    clearTimeout(typingTimeouts[timeoutKey]);
  }
  
  // Set a new timeout
  typingTimeouts[timeoutKey] = setTimeout(() => {
    socket.emit(event, { receiverId });
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

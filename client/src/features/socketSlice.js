import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { io } from "socket.io-client";
import { addMessage, setTyping } from "./chatSlice";

const BASE_URL = import.meta.env.VITE_BASE_URL;
let socket = null;

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
        console.log('✅ Connected to server with ID:', socket.id);

        // Register all listeners here
        socket.on('getOnlineUsers', (userIds) => {
          console.log("✅ Online users updated:", userIds);
          dispatch(setOnlineUsers(userIds));
        });

        socket.on('newMessage', (newMessage) => {
          console.log("✅ Received newMessage:", newMessage);
          const { selectedUser } = getState().chat;
          
          // Add the message regardless of selected user
          dispatch(addMessage(newMessage));
        });

        socket.on('typing', ({ senderId }) => {
          const selectedUser = getState().chat.selectedUser;
          if (selectedUser && senderId === selectedUser._id) {
            dispatch(setTyping(true));
            setTimeout(() => dispatch(setTyping(false)), 3000);
          }
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

  // export const subscribeToMessages = createAsyncThunk(
  //   'socket/subscribeToMessages',
  //   async (_, { getState, dispatch }) => {
  //     return; 
  //   }
  // );
  
  // export const unsubscribeFromMessages = createAsyncThunk(
  //   'socket/unsubscribeFromMessages',
  //   async () => {
  //     if (socket) {
  //       socket.off("newMessage");
  //     }
  //   }
  // );
  
  const socketSlice = createSlice({
    name: 'socket',
    initialState: {
      socketId: null,
      onlineUsers: [],
      
    },
    reducers: {
      setOnlineUsers: (state, action) => {
        state.onlineUsers = action.payload;
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
  
  export const { setOnlineUsers } = socketSlice.actions;
  export { socket };
  export default socketSlice.reducer;

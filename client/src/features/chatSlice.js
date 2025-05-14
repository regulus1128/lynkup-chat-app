import { toast } from "react-hot-toast";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../lib/axios.js";

export const getUsers = createAsyncThunk(
    "chat/getUsers",
    async (_, { rejectWithValue }) => {
      try {
        const res = await axiosInstance.get("/messages/users");
        return res.data;
      } catch (error) {
        toast.error(error.response.data.message);
        return rejectWithValue(error.response.data.message);
      }
    }
);

export const getMessages = createAsyncThunk(
    "chat/getMessages",
    async (userId, { rejectWithValue }) => {
      try {
        const res = await axiosInstance.get(`/messages/${userId}`);
        return res.data;
      } catch (error) {
        toast.error(error.response.data.message);
        return rejectWithValue(error.response.data.message);
      }
    }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ userId, messageData }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/messages/send/${userId}`, messageData);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const chatSlice = createSlice({
    name: "chat",
    initialState: {
      messages: [],
      users: [],
      selectedUser: null,
      isUsersLoading: false,
      isMessagesLoading: false,
      error: null,
      typing: false,
    },
    reducers: {
      setSelectedUser: (state, action) => {
        state.selectedUser = action.payload;
        if (action.payload === null) {
          state.messages = [];
        }
      },
      addMessage: (state, action) => {
        state.messages.push(action.payload);
      },
      clearMessages: (state) => {
        state.messages = [];
      },
      setTyping: (state, action) => {
        state.typing = action.payload;
      },
      markMessagesAsRead: (state, action) => {
        const readerId = action.payload;
      
        state.messages = state.messages.map((msg) => {
          if (msg.receiverId === readerId) {
            return { ...msg, isRead: true };
          }
          return msg;
        });
      },
    },
    extraReducers: (builder) => {
      builder
        // getUsers
        .addCase(getUsers.pending, (state) => {
          state.isUsersLoading = true;
        })
        .addCase(getUsers.fulfilled, (state, action) => {
          state.isUsersLoading = false;
          state.users = action.payload;
        })
        .addCase(getUsers.rejected, (state) => {
          state.isUsersLoading = false;
        })
  
        // getMessages
        .addCase(getMessages.pending, (state) => {
          state.isMessagesLoading = true;
        })
        .addCase(getMessages.fulfilled, (state, action) => {
          state.isMessagesLoading = false;
          state.messages = action.payload;
        })
        .addCase(getMessages.rejected, (state) => {
          state.isMessagesLoading = false;
        })
        .addCase(sendMessage.fulfilled, (state, action) => {
          state.messages.push(action.payload); // add new message to the array
        });
    },
  });
  
  export const { setSelectedUser, addMessage, clearMessages, setTyping, markMessagesAsRead } = chatSlice.actions;
  export default chatSlice.reducer;
  

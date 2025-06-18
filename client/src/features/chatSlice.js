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
  async (target, { rejectWithValue }) => {
    const { id, isGroup } = target;
    const url = isGroup ? `/group/messages/${id}` : `/messages/${id}`;
    try {
      const res = await axiosInstance.get(url);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching messages");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ userId, messageData }, { rejectWithValue }) => {
    try {
      const res = messageData.groupId 
      ? await axiosInstance.post(`/group/send-group/${messageData.groupId}`, messageData) 
      : await axiosInstance.post(`/messages/send/${userId}`, messageData);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getGroupDetails = createAsyncThunk(
  "chat/getGroupDetails",
  async (groupId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/group/group/${groupId}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch group");
    }
  }
);

export const getAllGroups = createAsyncThunk(
  "chat/getAllGroups",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/group/groups`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch groups");
    }
  }
);

const chatSlice = createSlice({
    name: "chat",
    initialState: {
      messages: [],
      users: [],
      groups: [],
      selectedUser: null,
      isUsersLoading: false,
      isMessagesLoading: false,
      error: null,
      typing: {
        targetId: null,
        isTyping: false,
      },
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
        state.typing = {
          targetId: action.payload.targetId,
          isTyping: action.payload.isTyping,
        };
      },
      markMessagesAsRead: (state, action) => {
        const { readerId, groupId } = action.payload;
      
        state.messages = state.messages.map((msg) => {
          const senderId = typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;
          
          if (groupId) {
            return msg.groupId === groupId && senderId === readerId
              ? { ...msg, isRead: true }
              : msg;
          } else {
            return msg.receiverId === readerId ? { ...msg, isRead: true } : msg;
          }
        });
      }
      
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
        })
        .addCase(getGroupDetails.fulfilled, (state, action) => {
          state.selectedUser = action.payload;
        })
        .addCase(getAllGroups.fulfilled, (state, action) => {
          state.groups = action.payload;
        })
    },
  });
  
  export const { setSelectedUser, addMessage, clearMessages, setTyping, markMessagesAsRead } = chatSlice.actions;
  export default chatSlice.reducer;
  

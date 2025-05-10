import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../lib/axios.js";
import toast from 'react-hot-toast';
import { connectSocket, disconnectSocket } from "./socketSlice.js";


export const checkAuth = createAsyncThunk(
    "auth/checkAuth",
    async (_, { rejectWithValue, dispatch }) => {
      try {
        const response = await axiosInstance.get("/auth/check");
        if(response.data){
          await dispatch(connectSocket()).unwrap();
        }
        
        return response.data;
      } catch (error) {
        console.error("Error in checkAuth:", error);
        return rejectWithValue(null);
      }
    }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosInstance.post('/auth/signup', data);
      if(res.data){
        await dispatch(connectSocket()).unwrap();
      }
      return res.data; // authUser data
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await axiosInstance.post('/auth/logout');
      dispatch(disconnectSocket());
      return true; // simple success indicator
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const res = await axiosInstance.post('/auth/login', data);
      if(res.data){
        await dispatch(connectSocket()).unwrap();

      }
      
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put('/auth/update-profile', data);
      return res.data;
    } catch (error) {
      console.log("error in update profile:", error);
      return rejectWithValue(error.response.data.message);
    }
  }
);





const initialState = {
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
      setAuthUser: (state, action) => {
        state.authUser = action.payload;
      },
      
      setSigningUp: (state, action) => {
        state.isSigningUp = action.payload;
      },
      setLoggingIn: (state, action) => {
        state.isLoggingIn = action.payload;
      },
      setUpdatingProfile: (state, action) => {
        state.isUpdatingProfile = action.payload;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(checkAuth.pending, (state) => {
          state.isCheckingAuth = true;
        })
        .addCase(checkAuth.fulfilled, (state, action) => {
          state.authUser = action.payload;
          state.isCheckingAuth = false;
          
        })
        .addCase(checkAuth.rejected, (state) => {
          state.authUser = null;
          state.isCheckingAuth = false;
        })
        .addCase(signup.pending, (state) => {
          state.isSigningUp = true;
        })
        .addCase(signup.fulfilled, (state, action) => {
          state.isSigningUp = false;
          state.authUser = action.payload;
          toast.success('Account created successfully');
          // socket connection can be triggered here if needed
        })
        .addCase(signup.rejected, (state, action) => {
          state.isSigningUp = false;
          toast.error(action.payload || 'Signup failed');
        })
        .addCase(logoutUser.fulfilled, (state) => {
          state.authUser = null;
          toast.success('Logged out successfully');
          // disconnectSocket logic can go here or be handled in a component/middleware
        })
        .addCase(logoutUser.rejected, (state, action) => {
          toast.error(action.payload || 'Logout failed');
        })
        .addCase(login.pending, (state) => {
          state.isLoggingIn = true;
        })
        .addCase(login.fulfilled, (state, action) => {
          state.isLoggingIn = false;
          state.authUser = action.payload;
          toast.success("Logged in successfully");
        })
        .addCase(login.rejected, (state, action) => {
          state.isLoggingIn = false;
          toast.error(action.payload || "Login failed");
        })
        .addCase(updateProfile.pending, (state) => {
          state.isUpdatingProfile = true;
        })
        .addCase(updateProfile.fulfilled, (state, action) => {
          state.isUpdatingProfile = false;
          state.authUser = {
            ...state.authUser,
            ...action.payload,
          };
          toast.success("Profile updated successfully");
        })
        .addCase(updateProfile.rejected, (state, action) => {
          state.isUpdatingProfile = false;
          toast.error(action.payload || "Failed to update profile");
        });
    },
});

export const {
    setAuthUser,
    logout,
    setSigningUp,
    setLoggingIn,
    setUpdatingProfile,
} = authSlice.actions;
  
export default authSlice.reducer;



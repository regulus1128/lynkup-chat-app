import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../features/authSlice";
import themeSlice from "../features/themeSlice";
import chatSlice from "../features/chatSlice";
import socketSlice from "../features/socketSlice";

export const store = configureStore({
    reducer: {
        auth: authSlice,
        theme: themeSlice,
        chat: chatSlice,
        socket: socketSlice,
    }
})
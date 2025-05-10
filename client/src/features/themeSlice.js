// features/theme/themeSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialTheme = localStorage.getItem('chat-theme') || 'coffee';

const themeSlice = createSlice({
  name: 'theme',
  initialState: {
    theme: initialTheme,
  },
  reducers: {
    setTheme: (state, action) => {
      const newTheme = action.payload;
      localStorage.setItem('chat-theme', newTheme);
      state.theme = newTheme;
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../api/auth";

type AuthState = {
    status: boolean;
    user: User | null;
    initialized: boolean;
};

const initialState: AuthState = {
    status: false,
    user: null,
    // Redux is reset after a full page reload or Vite refresh. This prevents protected routes from redirecting before the cookie-backed session check finishes.
    initialized: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<User>) => {
            state.status = true
            state.user = action.payload
            state.initialized = true
        },
        logout: (state) => {
            state.status = false
            state.user = null
            state.initialized = true
        },
        sessionCheckComplete: (state) => {
            state.initialized = true
        }
    }
})

export const { login, logout, sessionCheckComplete } = authSlice.actions
export default authSlice.reducer;

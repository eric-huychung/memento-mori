import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface User {
    name: string;
    email: string;
    picture: string;
}

interface UserState {
    user: User | null;
    loggedIn: boolean;
}

const initialState: UserState = {
    user: null,
    loggedIn: false,
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.loggedIn = true; 
        },
        logout: (state) => {
            state.user = null;
            state.loggedIn = false;
        },
    }
});

export const { login, logout } = userSlice.actions;

export const selectUser = (state: { user: UserState }) => state.user.user;
export const selectLoggedIn = (state: { user: UserState }) => state.user.loggedIn;

export default userSlice.reducer;

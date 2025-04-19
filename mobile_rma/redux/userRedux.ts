import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    firstname: null,
    lastname: null,
    userType: null,
    userId: null,
    accessToken: null,
    isFetching: false,
    error: null
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        loginStart: (state) => {
            state.isFetching = true;
        },
        loginSuccess: (state, action) => {
            const userData = action.payload;
            state.firstname = userData.firstname ?? userData.user?.firstname ?? null;
            state.lastname = userData.lastname ?? userData.user?.lastname ?? null;
            state.userType = userData.userType ?? userData.user?.userType ?? null;
            state.userId = userData.id ?? userData.user?.id ?? null;
            state.isFetching = false;
            state.accessToken = userData.token?.accessToken ?? userData.accessToken ?? null;
            state.error = null;
        },
        loginFail: (state, action) => {
            state.firstname = null;
            state.lastname = null;
            state.userType = null;
            state.userId = null;
            state.isFetching = false;
            state.accessToken = null;
            state.error = action.payload.error;
        },
        logOut: (state) => {
            Object.assign(state, initialState);
        },
        resetLoginState: (state) => {
            state.isFetching = false;
            state.error = null;
        },
    },
});

export const { 
    loginStart, 
    loginSuccess, 
    loginFail, 
    logOut, 
    resetLoginState 
} = userSlice.actions;

export default userSlice.reducer;
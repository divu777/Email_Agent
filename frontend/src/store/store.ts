import { configureStore } from "@reduxjs/toolkit";
import { authreducer } from "./slices/authSlice";
import { OAuthreducer } from "./slices/oauthSlice";
import { emailThreadReducer } from "./slices/emailSlice";

const store = configureStore({
    reducer:{
        authreducer,
        OAuthreducer,
        emailThreadReducer
    }
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
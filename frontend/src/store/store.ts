import { configureStore, combineReducers } from "@reduxjs/toolkit";

import { authreducer } from "./slices/authSlice";
import { OAuthreducer } from "./slices/oauthSlice";
import { emailThreadReducer } from "./slices/emailSlice";

// 1. Combine reducers
const rootReducer = combineReducers({
  authreducer,
  OAuthreducer,
  emailThreadReducer,
});

// 2. Create the store
export const store = configureStore({
  reducer: rootReducer,
});

// 3. Types
export type RootState = ReturnType<typeof store.getState>;
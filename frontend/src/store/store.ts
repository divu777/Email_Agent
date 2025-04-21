// 

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web

import { authreducer } from "./slices/authSlice";
import { OAuthreducer } from "./slices/oauthSlice";
import { emailThreadReducer } from "./slices/emailSlice";

// 1. Combine reducers
const rootReducer = combineReducers({
  authreducer,
  OAuthreducer,
  emailThreadReducer
});

// 2. Create persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["authreducer"] // choose what you want to persist
};

// 3. Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// 4. Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // redux-persist needs this
    }),
});

// 5. Export persistor
export const persistor = persistStore(store);

// 6. Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

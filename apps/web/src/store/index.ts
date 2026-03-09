// store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import shopReducer from "./shopSlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    shop: shopReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
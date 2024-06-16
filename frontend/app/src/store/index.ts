import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";

// Reduxストアの設定
const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// RootState型の定義
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch型の定義s
export type AppDispatch = typeof store.dispatch;

export default store;

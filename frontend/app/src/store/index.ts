import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import notificationReducer from "./notificationSlice";

// Reduxストアの設定
const store = configureStore({
  reducer: {
    auth: authReducer,
    notification: notificationReducer,
  },
});

// RootState型の定義
export type RootState = ReturnType<typeof store.getState>;

// AppDispatch型の定義s
export type AppDispatch = typeof store.dispatch;

export default store;

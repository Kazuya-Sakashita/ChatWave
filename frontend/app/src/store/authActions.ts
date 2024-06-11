import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../api/axiosConfig";

interface LogoutResponse {
  // 必要に応じてログアウトのレスポンスの型を定義
}

export const performLogout = createAsyncThunk<LogoutResponse, void>(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      await axios.delete("/logout");
      return {};
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export type AuthActionTypes = ReturnType<typeof performLogout>;

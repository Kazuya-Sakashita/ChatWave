import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../api/axiosConfig";
import { RootState } from "./index";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: any;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
};

// 非同期ログインアクション
export const performLogin = createAsyncThunk(
  "auth/login",
  async (credentials: { email: string; password: string }, thunkAPI) => {
    try {
      const response = await axios.post("/login", { user: credentials });
      const token = response.data.status.data.token;
      const user = response.data.status.data.user;
      if (token) {
        localStorage.setItem("token", token);
        return { token, user };
      } else {
        return thunkAPI.rejectWithValue("Token is missing in the response");
      }
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

// 非同期ログアウトアクション
export const performLogout = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      await axios.delete("/logout");
      localStorage.removeItem("token");
      return {};
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ token: string; user: any }>
    ) => {
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    logoutSuccess: (state) => {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        performLogin.fulfilled,
        (state, action: PayloadAction<{ token: string; user: any }>) => {
          state.isAuthenticated = true;
          state.token = action.payload.token;
          state.user = action.payload.user;
        }
      )
      .addCase(performLogin.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      })
      .addCase(performLogout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      })
      .addCase(performLogout.rejected, (state, action) => {
        // 追加のエラーハンドリングを行うことも可能
      });
  },
});

export const { loginSuccess, logoutSuccess } = authSlice.actions;
export default authSlice.reducer;

// セレクター
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectCurrentUser = (state: RootState) => state.auth.user;

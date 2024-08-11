import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../api/axiosConfig";
import { RootState } from "./index";

interface NotificationState {
  enabled: boolean;
}

const initialState: NotificationState = {
  enabled: true,
};

export const fetchNotificationSetting = createAsyncThunk(
  "notification/fetchSetting",
  async () => {
    const response = await axios.get("/notification_setting");
    return response.data.enabled;
  }
);

export const updateNotificationSetting = createAsyncThunk(
  "notification/updateSetting",
  async (enabled: boolean) => {
    await axios.put("/notification_setting", { enabled });
    return enabled;
  }
);

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(
        fetchNotificationSetting.fulfilled,
        (state, action: PayloadAction<boolean>) => {
          state.enabled = action.payload;
        }
      )
      .addCase(
        updateNotificationSetting.fulfilled,
        (state, action: PayloadAction<boolean>) => {
          state.enabled = action.payload;
        }
      );
  },
});

export default notificationSlice.reducer;

export const selectNotificationEnabled = (state: RootState) =>
  state.notification.enabled;

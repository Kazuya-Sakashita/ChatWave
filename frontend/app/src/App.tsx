import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import store, { AppDispatch } from "./store";
import SignupPage from "./components/SignupPage";
import LoginPage from "./components/LoginPage";
import Header from "./components/Header";
import RequireAuth from "./components/RequireAuth";
import EmailConfirmationPage from "./components/EmailConfirmationPage";
import PasswordResetRequestPage from "./components/PasswordResetRequestPage";
import PasswordResetPage from "./components/PasswordResetPage";
import ChatList from "./components/ChatList";
import GroupChatDetail from "./components/GroupChatDetail";
import DirectMessageDetail from "./components/DirectMessageDetail";
import { MessageProvider } from "./context/MessageContext";
import ProfilePage from "./components/ProfilePage";
import ProfileEditPage from "./components/ProfileEditPage";
import { fetchNotificationSetting } from "./store/notificationSlice";

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const fetchSetting = async () => {
      await dispatch(fetchNotificationSetting());
    };

    fetchSetting();
  }, [dispatch]);

  return (
    <MessageProvider>
      <Router>
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <ChatList />
              </RequireAuth>
            }
          />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/confirmation" element={<EmailConfirmationPage />} />
          <Route
            path="/password/reset"
            element={<PasswordResetRequestPage />}
          />
          <Route
            path="/password/edit/:reset_password_token"
            element={<PasswordResetPage />}
          />
          <Route
            path="/chats"
            element={
              <RequireAuth>
                <ChatList />
              </RequireAuth>
            }
          />
          <Route
            path="/groups/:groupId"
            element={
              <RequireAuth>
                <GroupChatDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/direct_messages"
            element={
              <RequireAuth>
                <GroupChatDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/direct_messages/:messageId"
            element={
              <RequireAuth>
                <DirectMessageDetail />
              </RequireAuth>
            }
          />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
        </Routes>
      </Router>
    </MessageProvider>
  );
};

const WrappedApp: React.FC = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

export default WrappedApp;

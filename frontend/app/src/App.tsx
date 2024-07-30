import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store";
import SignupPage from "./components/SignupPage";
import LoginPage from "./components/LoginPage";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import RequireAuth from "./components/RequireAuth";
import EmailConfirmationPage from "./components/EmailConfirmationPage";
import PasswordResetRequestPage from "./components/PasswordResetRequestPage";
import PasswordResetPage from "./components/PasswordResetPage";
import ProfilePage from "./components/ProfilePage";
import ProfileEditPage from "./components/ProfileEditPage";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <HomePage />
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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit" element={<ProfileEditPage />} />
          {/* 他のルート */}
        </Routes>
      </Router>
    </Provider>
  );
};
export default App;

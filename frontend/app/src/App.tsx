import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupPage from "./components/SignupPage";
import LoginPage from "./components/LoginPage";
import EmailConfirmationPage from "./components/EmailConfirmationPage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/confirmation" element={<EmailConfirmationPage />} />
        {/* 他のルート */}
      </Routes>
    </Router>
  );
};

export default App;

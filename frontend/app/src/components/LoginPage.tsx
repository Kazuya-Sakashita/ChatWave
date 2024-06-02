import React, { useState } from "react";
import axios from "../api/axiosConfig";
import styles from "./LoginPage.module.css";
import { useNavigate } from "react-router-dom";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    // 送信するデータをコンソールに出力
    console.log("Sending data:", { user: { email, password } });

    try {
      const response = await axios.post("/login", {
        user: { email, password },
      });
      // レスポンスをコンソールに出力
      console.log("Response data:", response.data);

      localStorage.setItem("token", response.data.token);
      alert("User logged in successfully");
      navigate("/");
    } catch (err) {
      // エラーをコンソールに出力
      console.error("Failed to login:", err);

      setError("Failed to login");
    }
  };

  return (
    <div className={styles["form-container"]}>
      <h1>Login</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;

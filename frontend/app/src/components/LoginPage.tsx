import React, { useState } from "react";
import axios from "../api/axiosConfig"; // 相対パスを使用してaxiosConfigをインポート
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";
import { isAxiosError } from "axios"; // axiosからisAxiosErrorをインポート

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      const response = await axios.post("/login", {
        user: { email, password }, // 正しい形式でデータを送信
      });
      const token = response.data.token;
      localStorage.setItem("token", token); // トークンを保存
      alert("Logged in successfully");
      navigate("/");
    } catch (err: unknown) {
      // 'unknown'型のエラーをキャッチ
      if (isAxiosError(err) && err.response) {
        setError(`Failed to login: ${err.response.data.error}`);
      } else {
        setError("Failed to login");
      }
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

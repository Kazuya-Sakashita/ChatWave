import React, { useState } from "react";
import axios from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";
import { isAxiosError } from "axios";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    console.log("Attempting to log in with email:", email);

    try {
      const response = await axios.post("/login", {
        user: { email, password },
      });
      console.log("Response:", response.data); // レスポンスをログ
      const token = response.data.status.data.token;
      if (token) {
        localStorage.setItem("token", token);
        console.log("Login successful, token:", token);
        alert("Logged in successfully");
        navigate("/");
      } else {
        throw new Error("Token is missing in the response");
      }
    } catch (err: unknown) {
      console.error("Login failed, error:", err);

      if (isAxiosError(err) && err.response) {
        setError(`Failed to login: ${err.response.data.error}`);
        console.error("Response error:", err.response.data);
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

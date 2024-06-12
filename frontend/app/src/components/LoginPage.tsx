import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";
import { performLogin } from "../store/authSlice";
import { AppDispatch } from "../store";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    try {
      const resultAction = await dispatch(performLogin({ email, password }));
      if (performLogin.fulfilled.match(resultAction)) {
        alert("Logged in successfully");
        navigate("/");
      } else {
        if (resultAction.payload) {
          setError(`Failed to login: ${resultAction.payload}`);
        } else {
          setError("Failed to login");
        }
      }
    } catch (err) {
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

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axiosConfig";
import ErrorMessage from "../components/ErrorMessage";
import styles from "./FormStyles.module.css";
import { PasswordResetPageState } from "../types/componentTypes";

const PasswordResetPage: React.FC = () => {
  const { reset_password_token } = useParams<{
    reset_password_token: string;
  }>();
  const [password, setPassword] =
    useState<PasswordResetPageState["password"]>("");
  const [passwordConfirmation, setPasswordConfirmation] =
    useState<PasswordResetPageState["passwordConfirmation"]>("");
  const [message, setMessage] =
    useState<PasswordResetPageState["message"]>(null);
  const [error, setError] = useState<PasswordResetPageState["error"]>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    if (password !== passwordConfirmation) {
      setError("Passwords do not match");
      return;
    }

    const requestData = {
      user: {
        reset_password_token,
        password,
        password_confirmation: passwordConfirmation,
      },
    };

    console.log("Sending data:", requestData); // コンソールに送信データを表示

    try {
      await axios.put("/password", requestData);
      setMessage("パスワードが正常にリセットされました");
      navigate("/login");
    } catch (err) {
      setError("パスワードのリセットに失敗しました");
      console.error(err);
    }
  };

  return (
    <div className={styles["form-container"]}>
      <h1>パスワードリセット</h1>
      <ErrorMessage message={error} />
      {message && <p style={{ color: "green" }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>新しいパスワード:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>パスワードを確認:</label>
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />
        </div>
        <button type="submit">パスワードをリセット</button>
      </form>
    </div>
  );
};

export default PasswordResetPage;

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axiosConfig";
import ErrorMessage from "../components/ErrorMessage";
import styles from "./FormStyles.module.css";
import { PasswordResetPageState } from "../types/componentTypes"; // PasswordResetPageState型をインポート

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
      setError("パスワードのリセットに失敗しました");
      return;
    }

    try {
      await axios.put("/password", {
        user: {
          reset_password_token,
          password,
          password_confirmation: passwordConfirmation,
        },
      });
      setMessage(
        "パスワードが正常にリセットされました。ログインページにリダイレクトします..."
      );
      setTimeout(() => {
        navigate("/login");
      }, 3000); // 3秒後にログインページにリダイレクト
    } catch (err) {
      setError("パスワードのリセットに失敗しました");
      console.error(err);
    }
  };

  return (
    <div className={styles["form-container"]}>
      <h1>パスワードリセット</h1>
      <ErrorMessage message={error} />
      {message && <p className={styles["success-message"]}>{message}</p>}
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

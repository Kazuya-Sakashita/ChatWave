import React, { useState } from "react";
import axios from "../api/axiosConfig";
import ErrorMessage from "../components/ErrorMessage";
import styles from "./FormStyles.module.css";

const PasswordResetRequestPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    try {
      await axios.post("/password", { user: { email } });
      setMessage("パスワードリセットリンクがメールアドレスに送信されました");
    } catch (err) {
      setError("パスワードリセットリンクの送信に失敗しました");
      console.error(err);
    }
  };

  return (
    <div className={styles["form-container"]}>
      <h1>パスワードリセットのリクエスト</h1>
      <ErrorMessage message={error} />
      {message && <p style={{ color: "green" }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>メールアドレス:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">リセットリンクを送信</button>
      </form>
    </div>
  );
};

export default PasswordResetRequestPage;

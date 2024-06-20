import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import styles from "./LoginPage.module.css";
import { performLogin } from "../store/authSlice";
import { AppDispatch } from "../store";
import ErrorMessage from "../components/ErrorMessage";
import { getErrorMessage } from "../utils/errorUtils";
import { LoginPageState } from "../types/componentTypes";

// LoginPageコンポーネントを定義
const LoginPage: React.FC = () => {
  // ローカルステートを定義
  const [email, setEmail] = useState<LoginPageState["email"]>("");
  const [password, setPassword] = useState<LoginPageState["password"]>("");
  const [error, setError] = useState<LoginPageState["error"]>(null);

  // フックを使用してナビゲートとディスパッチを設定
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // フォームの送信ハンドラーを定義
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      // performLoginアクションをディスパッチし、結果を取得
      const resultAction = await dispatch(performLogin({ email, password }));
      if (performLogin.fulfilled.match(resultAction)) {
        // ログイン成功時の処理
        alert("Logged in successfully");
        navigate("/");
      } else {
        // ログイン失敗時のエラーメッセージを取得して設定
        const errorMessage = getErrorMessage(
          resultAction.payload,
          "Failed to login"
        );
        setError(errorMessage);
      }
    } catch (err: any) {
      // 予期しないエラー発生時のエラーメッセージを取得して設定
      const errorMessage = getErrorMessage(err, "Failed to login");
      setError(errorMessage);
    }
  };

  return (
    <div className={styles["form-container"]}>
      <h1>Login</h1>
      {/* エラーメッセージを表示 */}
      <ErrorMessage message={error} />
      {/* ログインフォームをレンダリング */}
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
      <div className={styles["reset-link"]}>
        <Link to="/password/reset">Forgot your password?</Link>
      </div>
    </div>
  );
};

export default LoginPage;

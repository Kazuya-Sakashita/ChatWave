import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../store";
import { performLogout } from "../store/authSlice";
import useAuth from "../hooks/useAuth";

// Headerコンポーネントを定義
const Header: React.FC = () => {
  // useAuthフックを使用して認証状態とユーザー情報を取得
  const { isAuthenticated, user } = useAuth();
  // Reduxのdispatch関数を取得
  const dispatch = useDispatch<AppDispatch>();
  // React Routerのnavigate関数を取得
  const navigate = useNavigate();

  // ログアウトハンドラーを定義
  const handleLogout = async () => {
    try {
      // performLogoutアクションをディスパッチし、結果を取得
      const resultAction = await dispatch(performLogout());
      if (performLogout.fulfilled.match(resultAction)) {
        // ログアウト成功時の処理
        alert("Logged out successfully");
        navigate("/login");
      } else {
        // ログアウト失敗時のエラーメッセージをログに出力
        if (resultAction.payload) {
          console.error("Failed to logout:", resultAction.payload);
        } else {
          console.error("Failed to logout with unknown error");
        }
      }
    } catch (error: unknown) {
      // 予期しないエラー発生時のエラーメッセージをログに出力
      console.error("Failed to logout:", error);
    }
  };

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.logo}>
        ChatWave
      </Link>
      <nav>
        <ul>
          {isAuthenticated ? (
            <>
              {/* 認証済みユーザーへのナビゲーション */}
              <li>Welcome, {user?.email}</li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
              <li>
                <Link to="/profile">プロフィール</Link>
              </li>
              <li>
                {/* フレンド申請ページへのリンクを追加 */}
                <Link to="/send-friend-request">フレンド申請</Link>
              </li>
              <li>
                <Link to="/friends">フレンド一覧</Link>
              </li>
            </>
          ) : (
            <>
              {/* 非認証ユーザーへのナビゲーション */}
              <li>
                <Link to="/login">Login</Link>
              </li>
              <li>
                <Link to="/signup">Sign Up</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;

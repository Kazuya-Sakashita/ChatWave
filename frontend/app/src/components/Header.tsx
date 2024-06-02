import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axiosConfig"; // 相対パスを使用してaxiosConfigをインポート
import styles from "./Header.module.css";
import { isAxiosError } from "axios"; // axiosからisAxiosErrorをインポート

const Header: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // DELETEリクエストを送信してログアウト処理を行う
      await axios.delete("/logout");

      // トークンを削除して認証状態を更新
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      alert("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Failed to logout:", error);

      // AxiosErrorかどうかをチェック
      if (isAxiosError(error)) {
        console.error("Response error:", error.response?.data);
      } else {
        console.error("Unexpected error:", error);
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.logo}>ChatWave</div>
      <nav>
        <ul>
          {isAuthenticated ? (
            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          ) : (
            <>
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

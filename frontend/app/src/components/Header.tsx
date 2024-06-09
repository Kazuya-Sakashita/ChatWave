import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axiosConfig";
import styles from "./Header.module.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { logout, AuthActionTypes } from "../actions/authActions";
import { isAxiosError } from "axios";
import { ThunkDispatch } from "redux-thunk";

const Header: React.FC = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const dispatch: ThunkDispatch<RootState, void, AuthActionTypes> =
    useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // DELETEリクエストを送信してログアウト処理を行う
      await axios.delete("/logout");

      // トークンを削除して認証状態を更新
      dispatch(logout());
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
    if (token) {
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: token,
      });
    }
  }, [dispatch]);

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

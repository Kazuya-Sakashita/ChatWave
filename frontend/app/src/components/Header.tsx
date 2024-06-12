import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../api/axiosConfig";
import styles from "./Header.module.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store";
import { performLogout, loginSuccess } from "../store/authSlice";
import { isAxiosError } from "axios";

const Header: React.FC = () => {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const resultAction = await dispatch(performLogout());
      if (performLogout.fulfilled.match(resultAction)) {
        alert("Logged out successfully");
        navigate("/login");
      } else {
        if (resultAction.payload) {
          console.error("Failed to logout:", resultAction.payload);
        } else {
          console.error("Failed to logout with unknown error");
        }
      }
    } catch (error: unknown) {
      console.error("Failed to logout:", error);

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
      axios
        .get("/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => {
          dispatch(loginSuccess({ token, user: response.data.user }));
        })
        .catch((error) => {
          console.error("Failed to fetch user info:", error);
        });
    }
  }, [dispatch]);

  return (
    <header className={styles.header}>
      <div className={styles.logo}>ChatWave</div>
      <nav>
        <ul>
          {isAuthenticated ? (
            <>
              <li>Welcome, {user?.email}</li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </>
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

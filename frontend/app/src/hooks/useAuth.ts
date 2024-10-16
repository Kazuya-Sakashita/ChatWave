import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "../api/axiosConfig";
import {
  loginSuccess,
  logoutSuccess,
  selectIsAuthenticated,
  selectCurrentUser,
} from "../store/authSlice";
import { AppDispatch } from "../store";
import { isAxiosError } from "axios";

const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const [hasFetched, setHasFetched] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // ローディング状態を追加

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("useAuth hook initialized. Token:", token);

    if (token && !hasFetched) {
      axios
        .get("/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => {
          console.log("User info fetched successfully:", response.data);
          dispatch(loginSuccess({ token, user: response.data }));
          setHasFetched(true);
          setIsLoading(false); // フェッチ完了
        })
        .catch((error) => {
          console.error("Failed to fetch user info:", error);
          if (isAxiosError(error)) {
            console.error("Response error:", error.response?.data);
          } else {
            console.error("Unexpected error:", error);
          }
          dispatch(logoutSuccess());
          setHasFetched(true);
          setIsLoading(false); // フェッチ完了
        });
    } else if (!token) {
      setHasFetched(true);
      setIsLoading(false); // フェッチ完了
      console.log("No token found in localStorage");
    }
  }, [dispatch, hasFetched]);

  useEffect(() => {
    console.log("useAuth hook state updated:", { isAuthenticated, user });
  }, [isAuthenticated, user]);

  return { isAuthenticated, user, isLoading }; // isLoadingを返す
};

export default useAuth;

import { useEffect } from "react";
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

// useAuthフックを定義
const useAuth = () => {
  // Reduxのdispatch関数を取得
  const dispatch = useDispatch<AppDispatch>();
  // 認証状態を取得するためのセレクター
  const isAuthenticated = useSelector(selectIsAuthenticated);
  // 現在のユーザー情報を取得するためのセレクター
  const user = useSelector(selectCurrentUser);

  // コンポーネントがマウントされたときに実行される副作用フック
  useEffect(() => {
    // ローカルストレージからトークンを取得
    const token = localStorage.getItem("token");
    if (token) {
      // トークンが存在する場合、ユーザー情報を取得するAPIリクエストを送信
      axios
        .get("/me", { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => {
          // ユーザー情報の取得に成功した場合、Reduxストアにログイン情報を保存
          dispatch(loginSuccess({ token, user: response.data }));
        })
        .catch((error) => {
          // エラーが発生した場合、エラーメッセージをログに出力し、ログアウト処理を実行
          console.error("Failed to fetch user info:", error);
          if (isAxiosError(error)) {
            console.error("Response error:", error.response?.data);
          } else {
            console.error("Unexpected error:", error);
          }
          dispatch(logoutSuccess());
        });
    }
  }, [dispatch]);

  // 認証状態とユーザー情報を返す
  return { isAuthenticated, user };
};

export default useAuth;

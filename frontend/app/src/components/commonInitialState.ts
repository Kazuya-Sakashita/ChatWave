// 認証状態の初期値を定義するためのファイル
// ローカルストレージからトークンを取得し、初期状態を設定する
import { AuthState } from "../types/authTypes";

export const authInitialState: AuthState = {
  // ローカルストレージからトークンを取得して設定
  token: localStorage.getItem("token"),
  // トークンが存在するかどうかで認証状態を設定
  isAuthenticated: !!localStorage.getItem("token"),
  // エラー状態を初期化
  error: null,
  // ユーザー情報を初期化
  user: null,
};

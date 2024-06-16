// ErrorMessageコンポーネントのプロパティの型を定義（stringまたはnull）
export interface ErrorMessageProps {
  message: string | null;
}

// LoginPageコンポーネントのローカルステートの型を定義
export interface LoginPageState {
  email: string;
  password: string;
  error: string | null;
}

// SignupPageコンポーネントのローカルステートの型を定義
export interface SignupPageState {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  error: string;
}

// performLogoutアクションのレスポンス型を定義
export interface LogoutResponse {
  // 必要に応じてログアウトのレスポンスの型を定義
}

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

// PasswordResetRequestPageコンポーネントのローカルステートの型を定義
export interface PasswordResetRequestPageState {
  email: string;
  message: string | null;
  error: string | null;
}

// PasswordResetPageコンポーネントのローカルステートの型を定義
export interface PasswordResetPageState {
  password: string;
  passwordConfirmation: string;
  message: string | null;
  error: string | null;
}

// Group型を定義
export type Group = {
  id: number;
  name: string;
};

// DirectMessage型を定義
export type DirectMessage = {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
};

// Message型を定義
export type Message = {
  id: number;
  sender_id: number;
  content: string;
  sender_name: string;
  created_at: string;
};

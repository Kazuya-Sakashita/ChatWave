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
  fullName: string;
  birthDate: string;
  gender: string;
  phoneNumber: string;
  postalCode: string;
  address: string;
  avatar: File | null;
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

// Profileの型を定義
export interface Profile {
  fullName: string;
  birthDate: string;
  gender: string;
  phoneNumber: string;
  postalCode: string;
  address: string;
  avatar: string; // URLまたはファイルパス
  userId: number;
  visibility: Visibility; // 公開範囲の設定
}

// Visibilityの型を定義
export type Visibility = "public" | "private" | "friends";

// ProfilePageコンポーネントのローカルステートの型を定義
export interface ProfilePageState {
  fullName: string;
  birthDate: string;
  gender: string;
  phoneNumber: string;
  postalCode: string;
  address: string;
  avatar: File | null;
  visibility: Visibility;
  error: string | null;
}

// MessageContextのプロパティの型を定義
export interface MessageContextProps {
  newMessages: { [key: number]: boolean };
  setNewMessages: React.Dispatch<
    React.SetStateAction<{ [key: number]: boolean }>
  >;
  newDirectMessages: { [key: number]: boolean };
  setNewDirectMessages: React.Dispatch<
    React.SetStateAction<{ [key: number]: boolean }>
  >;
}

// MessageProviderコンポーネントのプロパティの型を定義
export interface MessageProviderProps {
  children: React.ReactNode;
}

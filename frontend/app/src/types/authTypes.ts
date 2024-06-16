export interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
  user: any; // 必要に応じてユーザーの具体的な型を定義
}

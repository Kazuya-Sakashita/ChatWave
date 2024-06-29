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
  hasNewMessages?: boolean; // 新着メッセージの有無
};

// DirectMessage型を定義
export type DirectMessage = {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  sender_name: string; // 送信者の名前
  recipient_name: string; // 受信者の名前
  created_at: string; // 作成日時
};

// Message型を定義
export type Message = {
  id: number;
  sender_id: number;
  content: string;
  sender_name: string; // 送信者の名前
  created_at: string; // 作成日時
  edited?: boolean; // 編集されたかどうか
  deleted?: boolean; // 削除されたかどうか
};

// GroupChatDetailのローカルステートの型を定義
export interface GroupChatDetailState {
  group: Group | null;
  messages: Message[];
  newMessage: string;
  editingMessageId: number | null;
}

// GroupMessageUpdateResponseの型を定義
export interface GroupMessageUpdateResponse {
  message: Message;
}

// NewMessagesResponseの型を定義
export interface NewMessagesResponse {
  new_messages: number[]; // 新着メッセージのグループIDのリスト
}

// ErrorMessageコンポーネントのプロパティの型を定義（stringまたはnull）
export interface ErrorMessageProps {
  message: string | null;
}

// src/types/componentTypes.ts

export interface MessageContextProps {
  newMessages: { [key: number]: boolean };
  setNewMessages: React.Dispatch<
    React.SetStateAction<{ [key: number]: boolean }>
  >;
}

export interface MessageProviderProps {
  children: React.ReactNode; // childrenの型を追加
}

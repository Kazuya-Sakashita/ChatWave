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
  edited?: boolean; // 編集されたかどうか
  is_read?: boolean; // 既読かどうかを表すプロパティを追加
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
  is_read?: boolean; // 既読かどうかを表すプロパティを追加
  readers_count?: number;
  total_group_members?: number;
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

// MessageContextPropsの型を定義
export interface MessageContextProps {
  newMessages: { [key: number]: boolean };
  setNewMessages: React.Dispatch<
    React.SetStateAction<{ [key: number]: boolean }>
  >;
  newDirectMessages: { [key: number]: boolean }; // 追加
  setNewDirectMessages: React.Dispatch<
    React.SetStateAction<{ [key: number]: boolean }>
  >; // 追加
}

export interface MessageProviderProps {
  children: React.ReactNode;
}

// MessageListPropsの型を定義
export interface MessageListProps {
  messages: (Message | DirectMessage)[];
  handleEdit: (messageId: number, currentContent: string) => void;
  handleDelete: (messageId: number) => void;
  user: any; // ユーザーの型定義
  chatType: "direct" | "group"; // chatTypeを追加
  groupId?: string; // グループIDをオプショナルに追加
  totalGroupMembers?: number;
}

// Profileの型を定義
export interface Profile {
  full_name: string;
  birth_date: string;
  gender: string;
  phone_number: string;
  postal_code: string;
  address: string;
  avatar_url: string;
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

// 新規追加: NotificationSettingの型を定義
export interface NotificationSetting {
  enabled: boolean;
}

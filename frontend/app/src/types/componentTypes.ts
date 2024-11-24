// ErrorMessageProps
export interface ErrorMessageProps {
  message: string | null;
}

// Auth Types
export interface LoginPageState {
  email: string;
  password: string;
  error: string | null;
}

export interface SignupPageState {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  fullName: string;
  birthDate: string;
  gender: string;
  phoneNumber: string;
  postalCode: string;
  address: string;
  avatar: File | null;
  error: string;
}

export interface LogoutResponse {}

// Password Reset Types
export interface PasswordResetRequestPageState {
  email: string;
  message: string | null;
  error: string | null;
}

export interface PasswordResetPageState {
  password: string;
  passwordConfirmation: string;
  message: string | null;
  error: string | null;
}

// Group and Message Types
export type Group = {
  id: number;
  name: string;
  hasNewMessages?: boolean;
};

export type DirectMessage = {
  id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  sender_name: string;
  recipient_name: string;
  created_at: string;
  edited?: boolean;
  is_read?: boolean;
};

export type Message = {
  id: number;
  sender_id: number;
  content: string;
  sender_name: string;
  created_at: string;
  edited?: boolean;
  deleted?: boolean;
  is_read?: boolean;
  readers_count?: number;
  total_group_members?: number;
};

export interface GroupChatDetailState {
  group: Group | null;
  messages: Message[];
  newMessage: string;
  editingMessageId: number | null;
}

export interface GroupMessageUpdateResponse {
  message: Message;
}

export interface NewMessagesResponse {
  new_messages: number[];
}

// Profile Types
export interface Profile {
  full_name: string;
  birth_date: string;
  gender: string;
  phone_number: string;
  postal_code: string;
  address: string;
  avatar_url: string;
}

export type Visibility = "public" | "private" | "friends";

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

// Notification Setting Type
export interface NotificationSetting {
  enabled: boolean;
}

// User and Friend Types
export interface User {
  id: number;
  name: string;
  email?: string;
  avatar_url?: string;
}

export interface Friend {
  id: number;
  name: string;
  email: string;
  confirmed: boolean;
  is_sender?: boolean;
  avatar_url?: string;
  isMutual: boolean;
}

export interface FriendsResponse {
  confirmed_friends: Friend[];
  pending_requests_sent: Friend[];
  pending_requests_received: Friend[];
  blocked_friends: Friend[];
  pending_requests: Friend[];
}

// FriendRequest Type
export interface FriendRequest {
  id: number;
  sender_id: number;
  sender_name?: string;
  recipient_id: number;
  recipient_name?: string;
  state: "pending" | "accepted" | "rejected";
  created_at: string;
}

export interface PendingFriendRequest {
  recipient_id: number;
}

// Message Context Types
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

export interface MessageProviderProps {
  children: React.ReactNode;
}

// MessageList Props
export interface MessageListProps {
  messages: (Message | DirectMessage)[];
  handleEdit: (messageId: number, currentContent: string) => void;
  handleDelete: (messageId: number) => void;
  user: User;
  chatType: "direct" | "group";
  groupId?: string;
  totalGroupMembers?: number;
}

// Notification Setting Type
export interface NotificationSetting {
  enabled: boolean;
}

// API Response Types
export interface FriendsResponse {
  confirmed_friends: Friend[];
  pending_requests_sent: Friend[];
  pending_requests_received: Friend[];
  blocked_friends: Friend[];
  pending_requests: Friend[];
}

export interface GroupMessageUpdateResponse {
  message: Message;
}

// Group Message Types
export type MessageType = "text" | "image" | "file";

// Message Context
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

// Provider Props
export interface MessageProviderProps {
  children: React.ReactNode;
}

// MemberSelectionProps 型を追加
export interface MemberSelectionProps {
  users: User[];
  selectedMembers: User[]; // 追加: 現在選択されているメンバー
  onSelectionChange: (selectedUsers: User[]) => void;
  resetSelection: boolean;
}

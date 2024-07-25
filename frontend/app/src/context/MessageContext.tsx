import React, { createContext, useState, useContext } from "react";
import {
  MessageContextProps,
  MessageProviderProps,
} from "../types/componentTypes";

// MessageContextの作成
// Contextを作成して、後で値を提供できるようにします。
// 初期値はundefinedに設定されています。
const MessageContext = createContext<MessageContextProps | undefined>(
  undefined
);

// MessageProviderコンポーネントの定義
// これはコンテキストプロバイダーで、アプリ全体に状態を提供するために使用されます。
export const MessageProvider: React.FC<MessageProviderProps> = ({
  children,
}) => {
  // newMessagesとsetNewMessagesの状態管理
  // newMessagesは、新着メッセージの状態を保持するオブジェクトで、setNewMessagesはその状態を更新する関数です。
  const [newMessages, setNewMessages] = useState<{ [key: number]: boolean }>(
    {}
  );

  // newDirectMessagesとsetNewDirectMessagesの状態管理を追加
  // newDirectMessagesは、ダイレクトメッセージの新着メッセージ状態を保持するオブジェクトで、setNewDirectMessagesはその状態を更新する関数です。
  const [newDirectMessages, setNewDirectMessages] = useState<{
    [key: number]: boolean;
  }>({});

  return (
    // ContextプロバイダーにnewMessages、setNewMessages、newDirectMessages、setNewDirectMessagesを渡す
    // これにより、子コンポーネントはこのコンテキストを使用してこれらの状態にアクセスできます。
    <MessageContext.Provider
      value={{
        newMessages,
        setNewMessages,
        newDirectMessages,
        setNewDirectMessages,
      }}
    >
      {/* 子コンポーネントをレンダリング */}
      {/* プロバイダー内の子コンポーネントはこのコンテキストの値にアクセスできます。 */}
      {children}
    </MessageContext.Provider>
  );
};

// useMessageContextフックの定義
// これは、コンポーネントでコンテキストを使用するためのカスタムフックです。
export const useMessageContext = () => {
  // Contextから現在の値を取得
  const context = useContext(MessageContext);

  // Contextが存在しない場合にエラーメッセージをスロー
  // これにより、コンテキストが適切にプロバイダー内で使用されていることを確認します。
  if (!context) {
    throw new Error("useMessageContext must be used within a MessageProvider");
  }

  return context; // Contextの値を返す
};

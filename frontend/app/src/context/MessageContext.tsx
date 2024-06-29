import React, { createContext, useState, useContext } from "react";
import {
  MessageContextProps,
  MessageProviderProps,
} from "../types/componentTypes";

// MessageContextの作成
const MessageContext = createContext<MessageContextProps | undefined>(
  undefined
);

// MessageProviderコンポーネントの定義
export const MessageProvider: React.FC<MessageProviderProps> = ({
  children,
}) => {
  // newMessagesとsetNewMessagesの状態管理
  const [newMessages, setNewMessages] = useState<{ [key: number]: boolean }>(
    {}
  );

  return (
    // ContextプロバイダーにnewMessagesとsetNewMessagesを渡す
    <MessageContext.Provider value={{ newMessages, setNewMessages }}>
      {children} {/* 子コンポーネントをレンダリング */}
    </MessageContext.Provider>
  );
};

// useMessageContextフックの定義
export const useMessageContext = () => {
  // Contextから現在の値を取得
  const context = useContext(MessageContext);

  // Contextが存在しない場合にエラーメッセージをスロー
  if (!context) {
    throw new Error("useMessageContext must be used within a MessageProvider");
  }

  return context; // Contextの値を返す
};

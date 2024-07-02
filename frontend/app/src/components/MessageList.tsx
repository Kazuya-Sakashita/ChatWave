// frontend/app/src/components/MessageList.tsx
import React from "react";
import { DirectMessage, Message } from "../types/componentTypes";

interface MessageListProps<T> {
  messages: T[];
  handleEdit: (messageId: number, currentContent: string) => void;
  handleDelete: (messageId: number) => void;
  user: any; // ユーザーの型定義
}

const MessageList = <
  T extends {
    id: number;
    sender_name: string;
    created_at: string;
    content: string;
    edited?: boolean;
  }
>({
  messages,
  handleEdit,
  handleDelete,
  user,
}: MessageListProps<T>) => {
  return (
    <ul>
      {messages.map((message, index) => {
        const messageClass =
          message.sender_name === user?.name ? "left" : "right";
        return (
          <li
            key={`${message.id}-${index}`}
            className={`message ${messageClass}`}
          >
            <div className="content">
              <strong>{message.sender_name}</strong> ({message.created_at}):{" "}
              {message.content}
              {message.sender_name === user?.name && (
                <>
                  <button
                    onClick={() => handleEdit(message.id, message.content)}
                  >
                    編集
                  </button>
                  <button
                    className="delete"
                    onClick={() => handleDelete(message.id)}
                  >
                    削除
                  </button>
                </>
              )}
              {message.edited && <span>(編集済)</span>}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default MessageList;

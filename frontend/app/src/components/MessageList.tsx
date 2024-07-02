// frontend/app/src/components/MessageList.tsx
import React from "react";
import { DirectMessage, Message } from "../types/componentTypes";

interface MessageListProps {
  messages: (Message | DirectMessage)[];
  handleEdit: (messageId: number, currentContent: string) => void;
  handleDelete: (messageId: number) => void;
  user: any; // ユーザーの型定義
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  handleEdit,
  handleDelete,
  user,
}) => {
  return (
    <ul>
      {messages.map((message, index) => {
        if (!message) return null;

        const isDirectMessage = (msg: any): msg is DirectMessage =>
          "recipient_id" in msg && "sender_id" in msg;

        const senderId = isDirectMessage(message)
          ? message.sender_id
          : message.sender_id;
        const senderName = isDirectMessage(message)
          ? message.sender_name
          : message.sender_name;
        const messageClass = senderId === user?.id ? "left" : "right";

        return (
          <li
            key={`${message.id}-${index}`}
            className={`message ${messageClass}`}
          >
            <div className="content">
              <strong>{senderName}</strong> ({message.created_at}):{" "}
              {message.content}
              {senderId === user?.id && (
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

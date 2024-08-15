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
      {messages
        .filter((msg): msg is Message | DirectMessage => !!msg)
        .map((message, index) => {
          const senderId = message.sender_id;
          const senderName = message.sender_name;
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
                {"edited" in message && message.edited && <span>(編集済)</span>}
              </div>
            </li>
          );
        })}
    </ul>
  );
};

export default MessageList;

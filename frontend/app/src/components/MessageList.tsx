import React from "react";
import { Message, DirectMessage } from "../types/componentTypes";

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
        const isDirectMessage = (
          msg: Message | DirectMessage
        ): msg is DirectMessage => {
          return (msg as DirectMessage).recipient_id !== undefined;
        };

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
              {"edited" in message && message.edited && <span>(編集済)</span>}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default MessageList;

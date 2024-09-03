import React, { useState, useEffect, useCallback } from "react";
import { DirectMessage, Message } from "../types/componentTypes";
import useMessageStatusChannel from "../hooks/useMessageStatusChannel";
import { createConsumer } from "@rails/actioncable";
import axios from "../api/axiosConfig";
import "../styles/ChatStyles.css";

interface MessageListProps {
  messages: (Message | DirectMessage)[];
  handleEdit: (messageId: number, currentContent: string) => void;
  handleDelete: (messageId: number) => void;
  user: any; // ユーザーの型定義
  chatType: "direct" | "group"; // chatTypeを追加
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  handleEdit,
  handleDelete,
  user,
  chatType, // chatTypeをプロパティとして追加
}) => {
  const [updatedMessages, setUpdatedMessages] = useState(messages);

  // 初期メッセージのセット
  useEffect(() => {
    setUpdatedMessages((prevMessages) => {
      // 既存のメッセージを保持しつつ、新しいメッセージをマージする
      const newMessages = messages.filter(
        (newMessage) =>
          !prevMessages.some((message) => message.id === newMessage.id)
      );
      const mergedMessages = [...prevMessages, ...newMessages];

      console.log("初期メッセージがセットされました:", mergedMessages);
      return mergedMessages;
    });
  }, [messages]);

  // メッセージの既読状態を更新
  const updateMessageStatus = useCallback(
    (messageId: number, status: string) => {
      setUpdatedMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === messageId
            ? { ...message, is_read: status === "read" }
            : message
        )
      );
      console.log(
        `メッセージID: ${messageId} の既読状態が更新されました: ${
          status === "read" ? "既読" : "未読"
        }`
      );
    },
    []
  );

  // メッセージを既読にする処理
  const markMessageAsRead = useCallback(
    async (messageId: number) => {
      try {
        await axios.post("/direct_messages/mark_as_read", {
          message_ids: [messageId],
        });
        updateMessageStatus(messageId, "read");
      } catch (error) {
        console.error("Failed to mark message as read:", error);
      }
    },
    [updateMessageStatus]
  );

  // 新しいメッセージを処理
  const handleNewMessage = useCallback(
    (newMessage: DirectMessage) => {
      setUpdatedMessages((prevMessages) => {
        const messageExists = prevMessages.some(
          (message) => message.id === newMessage.id
        );
        if (!messageExists) {
          return [...prevMessages, newMessage];
        } else {
          return prevMessages.map((message) =>
            message.id === newMessage.id ? newMessage : message
          );
        }
      });

      if (newMessage.recipient_id === user.id) {
        markMessageAsRead(newMessage.id);
      }
    },
    [markMessageAsRead, user.id]
  );

  useMessageStatusChannel(user.id, updateMessageStatus);

  // WebSocketでのリアルタイムメッセージ処理
  useEffect(() => {
    const cable = createConsumer("ws://localhost:3000/cable");

    const channel = cable.subscriptions.create(
      { channel: "DirectMessagesChannel", user_id: user.id },
      {
        received: (data) => {
          console.log("Received data:", data);

          if (data.action === "create") {
            handleNewMessage(data.direct_message);
          } else if (data.action === "read") {
            // メッセージの既読状態を更新
            updateMessageStatus(data.message_id, data.status);
          }
        },
      }
    );

    return () => {
      console.log("Unsubscribing from DirectMessagesChannel");
      channel.unsubscribe();
      cable.disconnect();
    };
  }, [user.id, handleNewMessage, updateMessageStatus]);

  return (
    <ul>
      {updatedMessages.map((message, index) => {
        const senderId = message.sender_id;
        const senderName = message.sender_name;
        const messageClass = senderId === user?.id ? "right" : "left";

        return (
          <li
            key={`${message.id}-${index}`}
            className={`message ${messageClass} ${
              senderId === user?.id ? "sent" : "received"
            }`}
          >
            <div className="content">
              {/* ダイレクトメッセージの場合にのみ既読・未読表示 */}
              {chatType === "direct" && senderId === user?.id && (
                <span className="read-status">
                  {message.is_read ? "既読" : "未読"}{" "}
                </span>
              )}
              <div className="message-body">
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
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default MessageList;

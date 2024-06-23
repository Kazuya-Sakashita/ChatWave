import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Group, Message } from "../types/componentTypes";
import useAuth from "../hooks/useAuth";
import "../styles/ChatStyles.css";
import {
  createConsumer,
  ChannelNameWithParams,
  Subscription,
} from "@rails/actioncable";

const GroupChatDetail: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const { user } = useAuth(); // 現在のユーザー情報を取得
  const formRef = useRef<HTMLFormElement | null>(null); // メッセージフォームを参照

  useEffect(() => {
    fetch(`http://localhost:3000/groups/${groupId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`Network response was not ok: ${text}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        setGroup(data.group);
        setMessages(data.messages);
        console.log("Fetched group and messages: ", data); // デバッグ用ログ
        scrollToForm();
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });

    // Action Cableの設定
    const cable = createConsumer("ws://localhost:3000/cable");

    const channelParams: ChannelNameWithParams = {
      channel: "MessageChannel",
      chat_room_type: "group",
      chat_room_id: groupId,
    };

    const subscription: Partial<Subscription> = {
      received(data: { message: Message }) {
        console.log("Received message: ", data.message); // 受信確認
        setMessages((prevMessages) => {
          const messageIndex = prevMessages.findIndex(
            (msg) => msg.id === data.message.id
          );
          if (messageIndex !== -1) {
            const updatedMessages = [...prevMessages];
            updatedMessages[messageIndex] = data.message;
            return updatedMessages;
          }
          return [...prevMessages, data.message];
        });
        scrollToForm();
      },
      connected() {
        console.log("Connected to the channel");
      },
      disconnected() {
        console.log("Disconnected from the channel");
      },
    };

    const channel = cable.subscriptions.create(
      channelParams,
      subscription as Subscription
    );

    // コンポーネントのアンマウント時にチャネルから退会
    return () => {
      channel.unsubscribe();
    };
  }, [groupId]);

  // メッセージ送信ハンドラー
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const url =
      editingMessageId !== null
        ? `http://localhost:3000/groups/${groupId}/messages/${editingMessageId}`
        : `http://localhost:3000/groups/${groupId}/create_message`;

    const method = editingMessageId !== null ? "PUT" : "POST";

    fetch(url, {
      method: method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: newMessage }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(`Network response was not ok: ${text}`);
          });
        }
        return response.json();
      })
      .then((data) => {
        if (editingMessageId !== null) {
          // 編集モードの終了
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === editingMessageId
                ? { ...msg, content: newMessage }
                : msg
            )
          );
          setEditingMessageId(null);
          console.log("Message edited successfully", data); // デバッグ用ログ
        } else {
          setMessages((prevMessages) => [...prevMessages, data.message]);
          console.log("Message sent successfully", data); // デバッグ用ログ
        }
        setNewMessage("");
        scrollToForm();
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  // メッセージ編集開始ハンドラー
  const handleEdit = (messageId: number, currentContent: string) => {
    setEditingMessageId(messageId);
    setNewMessage(currentContent); // フォームに編集対象のメッセージを表示
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // メッセージフォームまでスクロール
  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // グループ情報が読み込まれていない場合のローディング表示
  if (!group) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{group.name}</h1>
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
                  <button
                    onClick={() => handleEdit(message.id, message.content)}
                  >
                    Edit
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <form className="form-container" onSubmit={handleSubmit} ref={formRef}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button type="submit">
          {editingMessageId !== null ? "Update" : "Send"}
        </button>
      </form>
    </div>
  );
};

export default GroupChatDetail;

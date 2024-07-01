import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { DirectMessage } from "../types/componentTypes";
import useAuth from "../hooks/useAuth";
import "../styles/ChatStyles.css";
import { createConsumer, Subscription } from "@rails/actioncable";

const DirectMessageDetail: React.FC = () => {
  // URLパラメータからmessageIdを取得します
  const { messageId } = useParams<{ messageId: string }>();

  // メッセージの状態を管理するためのuseStateフック
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState(""); // 新しいメッセージの内容を管理するためのuseStateフック

  // ユーザー認証情報を取得するカスタムフック
  const { user, isAuthenticated, isLoading } = useAuth();

  // メッセージリストの末尾にスクロールするための参照
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // フォームの参照
  const formRef = useRef<HTMLFormElement>(null);

  // メッセージリストの末尾にスクロールする関数
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // フォームにスクロールする関数
  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // メッセージを取得するための関数
  const fetchDirectMessages = useCallback(async () => {
    if (!messageId) return;
    try {
      const response = await fetch(
        `http://localhost:3000/direct_messages/${messageId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data = await response.json();
      setMessages(data.direct_messages || []);
      scrollToBottom(); // メッセージを取得した後、リストの末尾にスクロール
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      setMessages([]); // エラーが発生した場合、メッセージを空にする
    }
  }, [messageId]);

  useEffect(() => {
    if (isLoading) return; // isLoading中は何もしない

    // 認証状態、ユーザー、またはmessageIdが存在しない場合、エラーメッセージを表示
    if (!isAuthenticated || !user || !messageId) {
      console.error("Authentication status, user, or messageId is missing:", {
        isAuthenticated,
        user,
        messageId,
      });
      return;
    }

    fetchDirectMessages(); // メッセージを取得

    // Action CableのWebSocket接続を作成
    const cable = createConsumer("ws://localhost:3000/cable");

    const subscription: Partial<Subscription> = {
      received(data: { direct_message: DirectMessage }) {
        console.log("Received message via WebSocket:", data);
        setMessages((prevMessages) => [...prevMessages, data.direct_message]);
        scrollToForm(); // 新しいメッセージを受信したらフォームにスクロール
      },
      connected() {
        console.log("Connected to the channel");
      },
      disconnected() {
        console.log("Disconnected from the channel");
      },
    };

    // WebSocketチャネルにサブスクライブ
    const channel = cable.subscriptions.create(
      { channel: "DirectMessagesChannel", user_id: user.id.toString() },
      subscription as Subscription
    );

    console.log("Subscribed to the channel");

    return () => {
      channel.unsubscribe();
      console.log("Unsubscribed from the channel");
    };
  }, [fetchDirectMessages, isAuthenticated, isLoading, user, messageId]);

  // メッセージ送信時の処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") {
      alert("メッセージを入力してください");
      return;
    }

    if (messages.length === 0) {
      console.error("メッセージが利用できないため、受信者IDを判断できません。");
      return;
    }

    const recipientId =
      messages[0].recipient_id === user?.id
        ? messages[0].sender_id
        : messages[0].recipient_id;

    try {
      const response = await fetch("http://localhost:3000/direct_messages", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          direct_message: {
            recipient_id: recipientId,
            content: newMessage,
          },
        }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `Network response was not ok: ${response.statusText}\n${text}`
        );
      }
      const data = await response.json();
      console.log("メッセージが送信されました:", data);
      setMessages((prevMessages) => [...prevMessages, data.direct_message]);
      setNewMessage("");
      scrollToBottom(); // メッセージを送信した後、リストの末尾にスクロール
    } catch (error) {
      console.error("フェッチ操作に問題が発生しました:", error);
    }
  };

  // ローディング中の表示
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // 認証情報がない場合の表示
  if (!isAuthenticated || !user || !messageId) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {messages.length === 0 ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {messages.map((message) => {
            if (!message) return null;
            const messageClass =
              message.sender_id === user?.id ? "left" : "right";
            return (
              <li key={message.id} className={`message ${messageClass}`}>
                <div className="content">
                  <strong>
                    {message.sender_id === user?.id
                      ? "自分 :"
                      : message.sender_name}
                  </strong>
                  {message.content}
                </div>
              </li>
            );
          })}
          <div ref={messagesEndRef} />
        </ul>
      )}
      <form className="form-container" onSubmit={handleSubmit} ref={formRef}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="メッセージを入力してください..."
        />
        <button type="submit">送信</button>
      </form>
    </div>
  );
};

export default DirectMessageDetail;

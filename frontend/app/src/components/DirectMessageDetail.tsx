import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { DirectMessage } from "../types/componentTypes";
import useAuth from "../hooks/useAuth";
import "../styles/ChatStyles.css";
import { createConsumer, Subscription } from "@rails/actioncable";
import MessageList from "./MessageList"; // MessageListコンポーネントをインポート

const DirectMessageDetail: React.FC = () => {
  const { messageId } = useParams<{ messageId: string }>();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { user, isAuthenticated, isLoading } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

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
      scrollToBottom();
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      setMessages([]);
    }
  }, [messageId]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user || !messageId) {
      console.error("Authentication status, user, or messageId is missing:", {
        isAuthenticated,
        user,
        messageId,
      });
      return;
    }

    fetchDirectMessages();

    const cable = createConsumer("ws://localhost:3000/cable");

    const subscription: Partial<Subscription> = {
      received(data: { direct_message: DirectMessage; action: string }) {
        console.log("Received message via WebSocket:", data);
        if (data.action === "delete") {
          setMessages((prevMessages) =>
            prevMessages.filter((msg) => msg.id !== data.direct_message.id)
          );
        } else if (data.action === "update") {
          setMessages((prevMessages) =>
            prevMessages.map((msg) =>
              msg.id === data.direct_message.id ? data.direct_message : msg
            )
          );
        } else {
          setMessages((prevMessages) => [...prevMessages, data.direct_message]);
        }
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
      { channel: "DirectMessagesChannel", user_id: user.id.toString() },
      subscription as Subscription
    );

    console.log("Subscribed to the channel");

    return () => {
      channel.unsubscribe();
      console.log("Unsubscribed from the channel");
    };
  }, [fetchDirectMessages, isAuthenticated, isLoading, user, messageId]);

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
      scrollToBottom();
    } catch (error) {
      console.error("フェッチ操作に問題が発生しました:", error);
    }
  };

  const handleEdit = (messageId: number, currentContent: string) => {
    setEditingMessageId(messageId);
    setNewMessage(currentContent);
    scrollToForm();
  };

  const handleDelete = async (messageId: number) => {
    if (window.confirm("このメッセージを削除してもよろしいですか？")) {
      try {
        const response = await fetch(
          `http://localhost:3000/direct_messages/${messageId}`,
          {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }
        console.log("メッセージを削除しました");
      } catch (error) {
        console.error("削除操作に問題がありました:", error);
      }
    }
  };

  const handleUpdateMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMessageId || newMessage.trim() === "") {
      alert("メッセージを入力してください");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/direct_messages/${editingMessageId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: newMessage }),
        }
      );
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }
      await response.json();
      setEditingMessageId(null);
      setNewMessage("");
      scrollToForm();
      console.log("メッセージを編集しました");
    } catch (error) {
      console.error("フェッチ操作に問題がありました:", error);
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
        <MessageList
          messages={messages}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          user={user}
        />
      )}
      <form
        className="form-container"
        onSubmit={editingMessageId ? handleUpdateMessage : handleSubmit}
        ref={formRef}
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="メッセージを入力してください..."
        />
        <button type="submit">{editingMessageId ? "更新" : "送信"}</button>
      </form>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default DirectMessageDetail;

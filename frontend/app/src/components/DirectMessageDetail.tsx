import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { DirectMessage } from "../types/componentTypes";
import useAuth from "../hooks/useAuth";
import "../styles/ChatStyles.css";
import { createConsumer, Subscription } from "@rails/actioncable";

const DirectMessageDetail: React.FC = () => {
  const { messageId } = useParams<{ messageId: string }>();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { user, isAuthenticated } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
    fetchDirectMessages();

    if (!isAuthenticated || !user || !messageId) return;

    const cable = createConsumer("ws://localhost:3000/cable");

    const subscription: Partial<Subscription> = {
      received(data: { direct_message: DirectMessage }) {
        console.log("Received message via WebSocket:", data);
        setMessages((prevMessages) => [...prevMessages, data.direct_message]);
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
  }, [fetchDirectMessages, isAuthenticated, user, messageId]);

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
                      ? "You :"
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
          placeholder="Type your message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default DirectMessageDetail;

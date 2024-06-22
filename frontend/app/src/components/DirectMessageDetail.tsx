import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { DirectMessage } from "../types/componentTypes";
import useAuth from "../hooks/useAuth";
import "../styles/ChatStyles.css";
import {
  createConsumer,
  ChannelNameWithParams,
  Subscription,
} from "@rails/actioncable";

const DirectMessageDetail: React.FC = () => {
  const { messageId } = useParams<{ messageId: string }>();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth(); // 現在のユーザー情報を取得
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const scrollToBottom = () => {
    console.log("scrollToBottom called");
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToForm = () => {
    console.log("scrollToForm called");
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    console.log("useEffect called, fetching direct messages...");
    fetch(`http://localhost:3000/direct_messages/${messageId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        console.log("Response status:", response.status);
        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.statusText}`
          );
        }
        return response.json();
      })
      .then((data) => {
        console.log("Received data:", data);
        if (data && data.direct_messages) {
          setMessages(data.direct_messages);
          scrollToBottom();
        } else {
          setMessages([]);
        }
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        setMessages([]); // エラーが発生した場合でも空の配列を設定
      });

    // Action Cableの設定
    const cable = createConsumer("ws://localhost:3000/cable");

    const channelParams: ChannelNameWithParams = {
      channel: "MessageChannel",
      chat_room_type: "direct",
      chat_room_id: messageId,
    };

    const subscription: Partial<Subscription> = {
      received(data: { direct_message: DirectMessage }) {
        console.log("Received message via WebSocket: ", data); // 受信確認
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

    console.log("Subscribing to the channel with params: ", channelParams);
    const channel = cable.subscriptions.create(
      channelParams,
      subscription as Subscription
    );

    console.log("Subscribed to the channel");

    return () => {
      console.log("Unsubscribing from the channel");
      channel.unsubscribe();
    };
  }, [messageId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSubmit called");

    if (messages.length === 0) {
      console.error("No messages available to determine recipient ID.");
      return;
    }

    const recipientId =
      messages[0].recipient_id === user?.id
        ? messages[0].sender_id
        : messages[0].recipient_id;

    console.log("Sending message to recipient ID:", recipientId);

    fetch("http://localhost:3000/direct_messages", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient_id: recipientId,
        content: newMessage,
      }),
    })
      .then((response) => {
        console.log("Send response status:", response.status);
        if (!response.ok) {
          throw new Error(
            `Network response was not ok: ${response.statusText}`
          );
        }
        return response.json();
      })
      .then((data) => {
        console.log("Message sent: ", data);
        setMessages((prevMessages) => [...prevMessages, data.direct_message]);
        setNewMessage("");
        scrollToBottom();
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  return (
    <div>
      {messages.length === 0 ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {messages.map((message) => {
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

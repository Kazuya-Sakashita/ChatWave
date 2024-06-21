import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DirectMessage } from "../types/componentTypes";
import useAuth from "../hooks/useAuth";
import "../styles/ChatStyles.css";

const DirectMessageDetail: React.FC = () => {
  const { messageId } = useParams<{ messageId: string }>();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth(); // 現在のユーザー情報を取得

  useEffect(() => {
    fetch(`http://localhost:3000/direct_messages/${messageId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setMessages(data.direct_messages);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  }, [messageId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const recipientId =
      messages.length > 0 && messages[0].recipient_id === user?.id
        ? messages[0].sender_id
        : messages[0]?.recipient_id;

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
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setMessages([...messages, data.direct_message]);
        setNewMessage("");
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  if (messages.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <ul>
        {messages.map((message) => {
          const messageClass =
            message.sender_id === user?.id ? "left" : "right";
          return (
            <li key={message.id} className={`message ${messageClass}`}>
              <div className="content">
                <strong>
                  {message.sender_id === user?.id ? "You" : message.sender_name}
                </strong>
                : {message.content}
              </div>
            </li>
          );
        })}
      </ul>
      <form className="form-container" onSubmit={handleSubmit}>
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

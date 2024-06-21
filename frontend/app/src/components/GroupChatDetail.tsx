import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Group, Message } from "../types/componentTypes";
import useAuth from "../hooks/useAuth";
import "../styles/ChatStyles.css"; // 正しいパスでCSSをインポート

const GroupChatDetail: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth(); // 現在のユーザー情報を取得

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
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setGroup(data.group);
        setMessages(data.messages);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  }, [groupId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    fetch(`http://localhost:3000/groups/${groupId}/create_message`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: newMessage }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setMessages([...messages, data.message]);
        setNewMessage("");
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  };

  if (!group) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{group.name}</h1>
      <ul>
        {messages.map((message) => {
          const messageClass =
            message.sender_name === user?.name ? "left" : "right";
          return (
            <li key={message.id} className={`message ${messageClass}`}>
              <div className="content">
                <strong>{message.sender_name}</strong> ({message.created_at}):{" "}
                {message.content}
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

export default GroupChatDetail;

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Group, Message } from "../types/componentTypes";
import useAuth from "../hooks/useAuth"; // useAuthフックをインポート
import "../styles/ChatStyles.css"; // 正しいパスでCSSをインポート

const GroupChatDetail: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
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
          console.log(`Message ID: ${message.id}, Class: ${messageClass}`);
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
    </div>
  );
};

export default GroupChatDetail;

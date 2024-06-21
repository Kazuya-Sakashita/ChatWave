import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DirectMessage } from "../types/componentTypes";
import useAuth from "../hooks/useAuth";
import "../styles/ChatStyles.css"; // 正しいパスでCSSをインポート

const DirectMessageDetail: React.FC = () => {
  const { messageId } = useParams<{ messageId: string }>();
  const [message, setMessage] = useState<DirectMessage | null>(null);
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
        setMessage(data.direct_message);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  }, [messageId]);

  if (!message) {
    return <div>Loading...</div>;
  }

  const messageClass = message.sender_id === user?.id ? "right" : "left";

  return (
    <div>
      <ul>
        <li className={`message ${messageClass}`}>
          <div className="content">
            <strong>
              {message.sender_id === user?.id ? "You" : message.sender_id}
            </strong>
            : {message.content}
          </div>
        </li>
      </ul>
    </div>
  );
};

export default DirectMessageDetail;

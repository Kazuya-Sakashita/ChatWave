import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Group, DirectMessage } from "../types/componentTypes";
import useAuth from "../hooks/useAuth";
import "../styles/ChatList.css"; // 正しいパスでCSSをインポート

const ChatList: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const { user } = useAuth(); // 現在のユーザー情報を取得

  useEffect(() => {
    fetch("http://localhost:3000/chats", {
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
        setGroups(data.groups);
        setDirectMessages(data.direct_messages);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  }, []);

  const getChatPartnerName = (dm: DirectMessage) => {
    return dm.sender_id === user?.id ? dm.recipient_name : dm.sender_name;
  };

  // 重複しない相手とのダイレクトメッセージを保持
  const uniqueChatPartners = new Map<number, DirectMessage>();

  directMessages.forEach((dm) => {
    const partnerId =
      dm.sender_id === user?.id ? dm.recipient_id : dm.sender_id;
    if (!uniqueChatPartners.has(partnerId)) {
      uniqueChatPartners.set(partnerId, dm);
    }
  });

  return (
    <div className="chat-list-container">
      <h1>Chat List</h1>
      <h2>Group Chats</h2>
      <ul className="chat-list">
        {groups.map((group) => (
          <li key={group.id}>
            <Link to={`/groups/${group.id}`}>{group.name}</Link>
          </li>
        ))}
      </ul>
      <h2>Direct Chats</h2>
      <ul className="chat-list">
        {Array.from(uniqueChatPartners.values()).map((dm) => (
          <li key={dm.id}>
            <Link to={`/direct_messages/${dm.id}`}>
              {getChatPartnerName(dm)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;

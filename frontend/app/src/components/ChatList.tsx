import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Group, DirectMessage } from "../types/componentTypes"; // 必要な型のみインポート

const ChatList: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);

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

  return (
    <div>
      <h1>Chat List</h1>
      <h2>Group Chats</h2>
      <ul>
        {groups.map((group) => (
          <li key={group.id}>
            <Link to={`/groups/${group.id}`}>{group.name}</Link>
          </li>
        ))}
      </ul>
      <h2>Direct Chats</h2>
      <ul>
        {directMessages.map((dm) => (
          <li key={dm.id}>
            <Link to={`/direct_messages/${dm.id}`}>
              {`From ${dm.sender_id} to ${dm.recipient_id}: ${dm.content}`}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;

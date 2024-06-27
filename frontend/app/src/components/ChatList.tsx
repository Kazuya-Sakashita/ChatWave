import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Group, DirectMessage } from "../types/componentTypes";
import useAuth from "../hooks/useAuth";
import "../styles/ChatList.css";
import {
  createConsumer,
  ChannelNameWithParams,
  Subscription,
} from "@rails/actioncable";

const ChatList: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const [newMessages, setNewMessages] = useState<{ [key: number]: boolean }>(
    {}
  );
  const { user } = useAuth();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch("http://localhost:3000/chats", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setGroups(data.groups);
        setDirectMessages(data.direct_messages);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };

    const fetchNewMessages = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/groups/new_messages",
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const newMessagesResponse = await response.json();
        console.log("New messages response: ", newMessagesResponse); // デバッグ用ログ
        setNewMessages(newMessagesResponse.new_messages);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };

    fetchChats();
    fetchNewMessages();

    // Action Cableの設定
    const cable = createConsumer("ws://localhost:3000/cable");

    const channelParams: ChannelNameWithParams = {
      channel: "NewMessageNotificationChannel",
    };

    const subscription: Partial<Subscription> = {
      received(data: { group_id: number; sender_id: number }) {
        console.log("Received new message notification: ", data); // デバッグ用ログ
        if (data.sender_id !== user?.id) {
          setNewMessages((prevNewMessages) => ({
            ...prevNewMessages,
            [data.group_id]: true,
          }));
        }
      },
      connected() {
        console.log("Connected to the NewMessageNotificationChannel");
      },
      disconnected() {
        console.log("Disconnected from the NewMessageNotificationChannel");
      },
    };

    const channel = cable.subscriptions.create(
      channelParams,
      subscription as Subscription
    );

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  const getChatPartnerName = (dm: DirectMessage) => {
    return dm.sender_id === user?.id ? dm.recipient_name : dm.sender_name;
  };

  const handleGroupClick = async (groupId: number) => {
    try {
      if (newMessages[groupId]) {
        const response = await fetch(
          `http://localhost:3000/groups/${groupId}/clear_new_messages`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Failed to clear new messages");
        }
        setNewMessages((prevNewMessages) => {
          const updatedNewMessages = { ...prevNewMessages };
          delete updatedNewMessages[groupId];
          return updatedNewMessages;
        });
        console.log(`Cleared new messages for group ${groupId}`); // デバッグ用ログ
      }
    } catch (error) {
      console.error("Failed to clear new messages:", error);
    }
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
            <Link
              to={`/groups/${group.id}`}
              onClick={() => handleGroupClick(group.id)}
            >
              {group.name}{" "}
              {newMessages[group.id] && <span className="new-badge">NEW</span>}
            </Link>
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

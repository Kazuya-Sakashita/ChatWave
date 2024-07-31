import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Group, DirectMessage } from "../types/componentTypes";
import useAuth from "../hooks/useAuth";
import "../styles/ChatList.css";
import {
  createConsumer,
  ChannelNameWithParams,
  Subscription,
} from "@rails/actioncable";
import { useMessageContext } from "../context/MessageContext";

const ChatList: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [directMessages, setDirectMessages] = useState<DirectMessage[]>([]);
  const { user } = useAuth();
  const {
    newMessages,
    setNewMessages,
    newDirectMessages,
    setNewDirectMessages,
  } = useMessageContext();
  const navigate = useNavigate();

  // グループチャットとダイレクトメッセージのリストを取得する関数
  const fetchChats = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:3000/chats", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("ネットワーク応答が正常ではありません");
      }
      const data = await response.json();
      setGroups(data.groups);
      setDirectMessages(data.direct_messages);
    } catch (error) {
      console.error("フェッチ操作に問題が発生しました:", error);
    }
  }, []);

  // 新着メッセージのリストを取得する関数
  const fetchNewMessages = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/direct_messages/new_messages",
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error("ネットワーク応答が正常ではありません");
      }
      const newMessagesResponse = await response.json();
      setNewDirectMessages(newMessagesResponse.new_messages);
    } catch (error) {
      console.error("フェッチ操作に問題が発生しました:", error);
    }
  }, [setNewDirectMessages]);

  // 初回ロード時にチャットリストと新着メッセージを取得し、WebSocketを設定する
  useEffect(() => {
    fetchChats();
    fetchNewMessages();

    // WebSocket接続の設定
    const cable = createConsumer("ws://localhost:3000/cable");

    const channelParams: ChannelNameWithParams = {
      channel: "NewMessageNotificationChannel",
    };

    const subscription: Partial<Subscription> = {
      received(data: { group_id?: number; sender_id: number }) {
        console.log("新着メッセージ通知を受信:", data);
        if (data.group_id !== undefined) {
          setNewMessages((prevNewMessages) => ({
            ...prevNewMessages,
            [data.group_id!]: true,
          }));
        } else {
          setNewDirectMessages((prevNewMessages) => ({
            ...prevNewMessages,
            [data.sender_id]: true,
          }));
        }
      },
      connected() {
        console.log("NewMessageNotificationChannelに接続されました");
      },
      disconnected() {
        console.log("NewMessageNotificationChannelから切断されました");
      },
    };

    const channel = cable.subscriptions.create(
      channelParams,
      subscription as Subscription
    );

    return () => {
      channel.unsubscribe();
    };
  }, [
    fetchChats,
    fetchNewMessages,
    user,
    setNewMessages,
    setNewDirectMessages,
  ]);

  // グループチャットをクリックしたときに新着メッセージをクリアする関数
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
          throw new Error("新着メッセージのクリアに失敗しました");
        }
        setNewMessages((prevNewMessages) => {
          const updatedNewMessages = { ...prevNewMessages };
          delete updatedNewMessages[groupId];
          return updatedNewMessages;
        });
      }
    } catch (error) {
      console.error("新着メッセージのクリアに失敗しました:", error);
    }
  };

  // ダイレクトメッセージをクリックしたときに新着メッセージをクリアする関数
  const handleDirectMessageClick = async (senderId: number) => {
    try {
      if (newDirectMessages[senderId]) {
        const response = await fetch(
          `http://localhost:3000/direct_messages/clear_new_messages?sender_id=${senderId}`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("新着メッセージのクリアに失敗しました");
        }
        setNewDirectMessages((prevNewMessages) => {
          const updatedNewMessages = { ...prevNewMessages };
          delete updatedNewMessages[senderId];
          return updatedNewMessages;
        });
      }
      navigate(`/direct_messages/${senderId}`);
    } catch (error) {
      console.error("新着メッセージのクリアに失敗しました:", error);
    }
  };

  // チャットパートナーの名前を取得する関数
  const getChatPartnerName = (dm: DirectMessage) => {
    return dm.sender_id === user?.id ? dm.recipient_name : dm.sender_name;
  };

  // ユニークなチャットパートナーを取得する
  const uniqueChatPartners = new Map<number, DirectMessage>();
  directMessages.forEach((dm) => {
    const partnerId =
      dm.sender_id === user?.id ? dm.recipient_id : dm.sender_id;
    if (!uniqueChatPartners.has(partnerId)) {
      uniqueChatPartners.set(partnerId, dm);
    }
  });

  // チャットリストの表示
  return (
    <div className="chat-list-container">
      <h1>チャットリスト</h1>
      <h2>グループチャット</h2>
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
      <h2>ダイレクトチャット</h2>
      <ul className="chat-list">
        {Array.from(uniqueChatPartners.values()).map((dm) => (
          <li key={dm.id}>
            <Link
              to={`/direct_messages/${dm.id}`}
              onClick={() =>
                handleDirectMessageClick(
                  dm.sender_id === user?.id ? dm.recipient_id : dm.sender_id
                )
              }
            >
              {getChatPartnerName(dm)}{" "}
              {newDirectMessages[
                dm.sender_id === user?.id ? dm.recipient_id : dm.sender_id
              ] && <span className="new-badge">NEW</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChatList;

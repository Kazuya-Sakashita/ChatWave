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
import axios from "../api/axiosConfig";

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

  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(true);

  // 通知設定をフェッチする関数
  const fetchNotificationSetting = useCallback(async () => {
    try {
      const response = await axios.get("/notification_setting");
      setNotificationEnabled(response.data.enabled);
    } catch (error) {
      console.error("通知設定の取得に失敗しました:", error);
    }
  }, []);

  // 新着メッセージのリストを取得する関数（グループとダイレクト両方）
  const fetchNewMessages = useCallback(async () => {
    if (!notificationEnabled) return; // 通知がオフの場合は何もしない

    try {
      // グループの新着メッセージ取得
      const groupResponse = await fetch(
        "http://localhost:3000/groups/new_messages",
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!groupResponse.ok) {
        throw new Error("グループの新着メッセージ取得に失敗しました");
      }
      const groupMessages = await groupResponse.json();

      if (typeof groupMessages.new_messages === "object") {
        setNewMessages(groupMessages.new_messages);
      } else {
        console.error(
          "Unexpected data format for group messages:",
          groupMessages.new_messages
        );
      }

      // ダイレクトメッセージの新着メッセージ取得
      const directResponse = await fetch(
        "http://localhost:3000/direct_messages/new_messages",
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!directResponse.ok) {
        throw new Error("ダイレクトメッセージの新着取得に失敗しました");
      }
      const directMessagesResponse = await directResponse.json();
      setNewDirectMessages(directMessagesResponse.new_messages);
    } catch (error) {
      console.error("新着メッセージの取得に失敗しました:", error);
    }
  }, [setNewMessages, setNewDirectMessages, notificationEnabled]);

  // グループチャットとダイレクトメッセージのリストを取得する関数
  const fetchChats = useCallback(async () => {
    try {
      // 通知設定を取得
      await fetchNotificationSetting();

      // チャット情報を取得
      const response = await fetch("http://localhost:3000/chats", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("チャット情報の取得に失敗しました");
      }
      const data = await response.json();
      setGroups(data.groups);
      setDirectMessages(data.direct_messages);

      // 新着メッセージの取得
      if (notificationEnabled) {
        await fetchNewMessages();
      }
    } catch (error) {
      console.error("フェッチ操作に問題が発生しました:", error);
    }
  }, [fetchNewMessages, fetchNotificationSetting, notificationEnabled]);

  // 初回ロード時にチャットリストと新着メッセージを取得し、WebSocketを設定する
  useEffect(() => {
    fetchChats();

    // WebSocket接続の設定
    const cable = createConsumer("ws://localhost:3000/cable");

    const channelParams: ChannelNameWithParams = {
      channel: "NewMessageNotificationChannel",
    };

    const subscription: Partial<Subscription> = {
      received(data: { group_id?: number; sender_id: number }) {
        // 通知設定が有効な場合のみ、新着表示を更新
        if (notificationEnabled) {
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
    user,
    setNewMessages,
    setNewDirectMessages,
    notificationEnabled,
  ]);

  // 通知設定のトグル変更時に再フェッチ
  const handleToggleNotification = async () => {
    try {
      const newEnabledState = !notificationEnabled;
      setNotificationEnabled(newEnabledState);

      await axios.put("/notification_setting", {
        enabled: newEnabledState,
      });

      fetchChats(); // トグル後にチャットリストを再フェッチ
    } catch (error) {
      console.error("通知設定の変更に失敗しました:", error);
    }
  };

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
              {notificationEnabled && newMessages[group.id] && (
                <span className="new-badge">NEW</span>
              )}
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
              {notificationEnabled &&
                newDirectMessages[
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

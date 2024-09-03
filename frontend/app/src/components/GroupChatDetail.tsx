import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Group, Message } from "../types/componentTypes";
import useAuth from "../hooks/useAuth";
import { createConsumer, Subscription } from "@rails/actioncable";
import MessageList from "./MessageList";
import MessageForm from "./MessageForm";
import "../styles/ChatStyles.css";
import { useMessageContext } from "../context/MessageContext"; // 新着メッセージのコンテキストをインポート

const GroupChatDetail: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const { user, isAuthenticated, isLoading } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setNewMessages } = useMessageContext(); // 新着メッセージを更新するためのコンテキストフック

  // 新着メッセージをクリアする関数
  const clearNewMessages = useCallback(async () => {
    try {
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
        throw new Error("ネットワーク応答が正常ではありません");
      }
      const data = await response.json();
      console.log("新着メッセージをクリアしました: ", data);

      // 新着メッセージの状態を更新
      setNewMessages((prevNewMessages) => {
        const updatedNewMessages = { ...prevNewMessages };
        delete updatedNewMessages[Number(groupId)];
        return updatedNewMessages;
      });
    } catch (error) {
      console.error("フェッチ操作に問題がありました:", error);
    }
  }, [groupId, setNewMessages]);

  // メッセージリストの末尾にスクロールする関数
  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // メッセージを取得するための関数
  const fetchGroupData = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3000/groups/${groupId}`, {
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
      setGroup(data.group);
      setMessages(data.messages);
      if (data.group.new_messages) {
        await clearNewMessages();
      }
      scrollToForm();
    } catch (error) {
      console.error("フェッチ操作に問題がありました:", error);
    }
  }, [groupId, clearNewMessages]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user || !groupId) {
      console.error("Authentication status, user, or groupId is missing:", {
        isAuthenticated,
        user,
        groupId,
      });
      return;
    }

    fetchGroupData();

    const cable = createConsumer("ws://localhost:3000/cable");

    const subscription: Partial<Subscription> = {
      received(data: {
        message: Message;
        message_id?: number;
        action?: string;
      }) {
        if (data.action === "delete" && data.message_id) {
          setMessages((prevMessages) =>
            prevMessages.filter((message) => message.id !== data.message_id)
          );
        } else {
          setMessages((prevMessages) => {
            const existingIndex = prevMessages.findIndex(
              (message) => message.id === data.message.id
            );
            if (existingIndex !== -1) {
              const updatedMessages = [...prevMessages];
              updatedMessages[existingIndex] = data.message;
              return updatedMessages;
            } else {
              return [...prevMessages, data.message];
            }
          });
          // 新しいメッセージを受信したら新着メッセージをクリア
          clearNewMessages();
        }
        scrollToForm();
      },
      connected() {
        console.log("チャンネルに接続しました");
      },
      disconnected() {
        console.log("チャンネルから切断されました");
      },
    };

    const channel = cable.subscriptions.create(
      {
        channel: "MessageChannel",
        chat_room_type: "group",
        chat_room_id: groupId,
      },
      subscription as Subscription
    );

    return () => {
      channel.unsubscribe();
    };
  }, [
    fetchGroupData,
    isAuthenticated,
    isLoading,
    user,
    groupId,
    clearNewMessages,
  ]);

  // メッセージ送信時の処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newMessage.trim() === "") {
      alert("メッセージを入力してください");
      return;
    }

    if (editingMessageId !== null) {
      try {
        const response = await fetch(
          `http://localhost:3000/groups/${groupId}/messages/${editingMessageId}`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: newMessage }),
          }
        );
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }
        await response.json();
        setEditingMessageId(null);
        setNewMessage("");
        scrollToForm();
        console.log("メッセージを編集しました");
      } catch (error) {
        console.error("フェッチ操作に問題がありました:", error);
      }
    } else {
      try {
        const response = await fetch(
          `http://localhost:3000/groups/${groupId}/create_message`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: newMessage }),
          }
        );
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }
        await response.json();
        setNewMessage("");
        scrollToForm();
        console.log("メッセージを送信しました");
      } catch (error) {
        console.error("フェッチ操作に問題がありました:", error);
      }
    }
  };

  // メッセージ編集時の処理
  const handleEdit = (messageId: number, currentContent: string) => {
    setEditingMessageId(messageId);
    setNewMessage(currentContent);
    scrollToForm();
  };

  const handleCancel = () => {
    setEditingMessageId(null);
    setNewMessage("");
  };

  // メッセージ削除時の処理
  const handleDelete = async (messageId: number) => {
    if (window.confirm("このメッセージを削除してもよろしいですか？")) {
      try {
        const response = await fetch(
          `http://localhost:3000/groups/${groupId}/messages/${messageId}`,
          {
            method: "DELETE",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text);
        }
        console.log("メッセージを削除しました");
      } catch (error) {
        console.error("削除操作に問題がありました:", error);
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user || !groupId) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{group?.name}</h1>
      <MessageList
        messages={messages}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        user={user}
        chatType="group"
      />
      <MessageForm
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
        formRef={formRef}
        inputRef={inputRef}
        editingMessageId={editingMessageId}
      />
      <div ref={messagesEndRef} />
    </div>
  );
};

export default GroupChatDetail;

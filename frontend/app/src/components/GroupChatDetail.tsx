import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Group, Message } from "../types/componentTypes";
import useAuth from "../hooks/useAuth";
import { createConsumer, Subscription } from "@rails/actioncable";
import MessageList from "./MessageList";
import MessageForm from "./MessageForm";
import "../styles/ChatStyles.css";
import { useMessageContext } from "../context/MessageContext";

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
  const { setNewMessages } = useMessageContext();

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

      setNewMessages((prevNewMessages) => {
        const updatedNewMessages = { ...prevNewMessages };
        delete updatedNewMessages[Number(groupId)];
        return updatedNewMessages;
      });
    } catch (error) {
      console.error("フェッチ操作に問題がありました:", error);
    }
  }, [groupId, setNewMessages]);

  const scrollToForm = useCallback(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

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
  }, [groupId, clearNewMessages, scrollToForm]);

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
        readers_count?: number;
        total_group_members?: number;
      }) {
        if (data.action === "delete" && data.message_id) {
          setMessages((prevMessages) =>
            prevMessages.filter((message) => message.id !== data.message_id)
          );
        } else if (data.action === "update_read_count" && data.message_id) {
          setMessages((prevMessages) =>
            prevMessages.map((message) =>
              message.id === data.message_id
                ? {
                    ...message,
                    readers_count: data.readers_count,
                    total_group_members: data.total_group_members,
                  }
                : message
            )
          );
        } else if (data.message) {
          setMessages((prevMessages) => {
            const existingIndex = prevMessages.findIndex(
              (message) => message && message.id === data.message.id
            );
            if (existingIndex !== -1) {
              const updatedMessages = [...prevMessages];
              updatedMessages[existingIndex] = data.message;
              return updatedMessages;
            } else {
              return [...prevMessages, data.message];
            }
          });
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
    scrollToForm,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newMessage.trim() === "") {
      alert("メッセージを入力してください");
      return;
    }

    try {
      const url =
        editingMessageId !== null
          ? `http://localhost:3000/groups/${groupId}/messages/${editingMessageId}`
          : `http://localhost:3000/groups/${groupId}/create_message`;
      const method = editingMessageId !== null ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newMessage }),
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text);
      }
      const messageData = await response.json();
      setEditingMessageId(null);
      setNewMessage("");
      scrollToForm();
      console.log("メッセージを送信しました");

      // メッセージ送信後に送信者を既読にする処理を追加
      if (messageData.message && user) {
        await markMessageAsRead(messageData.message.id);
      }
    } catch (error) {
      console.error("フェッチ操作に問題がありました:", error);
    }
  };

  // 送信者がメッセージを既読にする処理
  const markMessageAsRead = async (messageId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/groups/mark_as_read`, // エンドポイントを正しい形式に修正
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message_id: messageId, group_id: groupId }), // 必要なデータを送信
        }
      );
      if (!response.ok) {
        throw new Error("メッセージの既読処理に失敗しました");
      }
      console.log("メッセージを既読にしました: ", messageId);
    } catch (error) {
      console.error("既読処理に問題がありました:", error);
    }
  };

  const handleEdit = (messageId: number, currentContent: string) => {
    setEditingMessageId(messageId);
    setNewMessage(currentContent);
    scrollToForm();
  };

  const handleCancel = () => {
    setEditingMessageId(null);
    setNewMessage("");
  };

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
        setMessages((prevMessages) =>
          prevMessages.filter((message) => message.id !== messageId)
        );
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

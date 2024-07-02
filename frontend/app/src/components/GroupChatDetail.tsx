import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Group, Message } from "../types/componentTypes";
import useAuth from "../hooks/useAuth";
import { createConsumer, Subscription } from "@rails/actioncable";
import MessageList from "./MessageList";
import MessageForm from "./MessageForm";
import "../styles/ChatStyles.css";

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

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const clearNewMessages = async () => {
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
    } catch (error) {
      console.error("フェッチ操作に問題がありました:", error);
    }
  };

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
  }, [groupId]);

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
  }, [fetchGroupData, isAuthenticated, isLoading, user, groupId]);

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

  const handleEdit = (messageId: number, currentContent: string) => {
    setEditingMessageId(messageId);
    setNewMessage(currentContent);
    scrollToForm();
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
      />
      <MessageForm
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSubmit={handleSubmit}
        formRef={formRef}
        inputRef={inputRef}
      />
      <div ref={messagesEndRef} />
    </div>
  );
};

export default GroupChatDetail;

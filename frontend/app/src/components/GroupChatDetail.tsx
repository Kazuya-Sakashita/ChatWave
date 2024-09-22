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

  const processedMessageIds = useRef<Set<number>>(new Set());
  const cableRef = useRef<ReturnType<typeof createConsumer> | null>(null); // WebSocket接続管理用の参照

  const scrollToForm = useCallback(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

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

  const markMessageAsRead = useCallback(
    async (messageId: number) => {
      if (processedMessageIds.current.has(messageId)) {
        return;
      }
      processedMessageIds.current.add(messageId);

      try {
        const response = await fetch(
          "http://localhost:3000/groups/mark_as_read",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message_id: messageId, group_id: groupId }),
          }
        );
        if (!response.ok) {
          throw new Error("メッセージの既読処理に失敗しました");
        }
        console.log(`メッセージID: ${messageId}の既読通知が送信されました`);
      } catch (error) {
        console.error("既読処理に問題がありました:", error);
      }
    },
    [groupId]
  );

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

      setMessages((prevMessages) => {
        const mergedMessages = data.messages.map((newMessage: Message) => {
          const existingMessage = prevMessages.find(
            (msg) => msg.id === newMessage.id
          );
          return existingMessage
            ? { ...existingMessage, ...newMessage }
            : newMessage;
        });

        console.log("マージ後のメッセージリスト: ", mergedMessages);

        return mergedMessages;
      });

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

    if (cableRef.current) {
      console.log("既存のWebSocket接続が存在します。再接続を防止します。");
      return;
    }

    const cable = createConsumer("ws://localhost:3000/cable");
    cableRef.current = cable;

    const subscription: Partial<Subscription> = {
      received(data: {
        message: Message;
        message_id?: number;
        action?: string;
        readers_count?: number;
        total_group_members?: number;
      }) {
        console.log("受信データ: ", data);

        switch (data.action) {
          case "delete":
            if (data.message_id) {
              setMessages((prevMessages) =>
                prevMessages.filter((message) => message.id !== data.message_id)
              );
            }
            break;

          case "update_read_count":
            if (data.message_id) {
              console.log(
                `メッセージID ${data.message_id} の既読カウントが更新されました`
              );

              setMessages((prevMessages) => {
                const updatedMessages = prevMessages.map((message) =>
                  message.id === data.message_id &&
                  message.readers_count !== data.readers_count
                    ? {
                        ...message,
                        readers_count: data.readers_count,
                        total_group_members: data.total_group_members,
                      }
                    : message
                );

                console.log(
                  "既読カウント更新後のメッセージリスト: ",
                  updatedMessages
                );

                return updatedMessages;
              });
            }
            break;

          default:
            if (data.message) {
              setMessages((prevMessages) => {
                const existingMessage = prevMessages.find(
                  (message) => message.id === data.message.id
                );

                if (existingMessage) {
                  const updatedMessages = prevMessages.map((message) =>
                    message.id === data.message.id
                      ? { ...message, ...data.message }
                      : message
                  );
                  console.log("重複メッセージを更新しました: ", data.message);
                  return updatedMessages;
                } else {
                  console.log(
                    "新しいメッセージが追加されました: ",
                    data.message
                  );
                  return [...prevMessages, data.message];
                }
              });

              if (data.message && data.message.sender_id !== user.id) {
                console.log(
                  `メッセージ ${data.message.id} の既読通知を送信します`
                );
                markMessageAsRead(data.message.id);
              }

              clearNewMessages();
            }
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
      cableRef.current = null;
    };
  }, [
    fetchGroupData,
    isAuthenticated,
    isLoading,
    user,
    groupId,
    clearNewMessages,
    scrollToForm,
    markMessageAsRead,
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
      const data = await response.json();
      setMessages((prevMessages) => {
        const existingMessage = prevMessages.find(
          (message) => message.id === data.message.id
        );

        if (existingMessage) {
          return prevMessages.map((message) =>
            message.id === data.message.id ? data.message : message
          );
        } else {
          return [...prevMessages, data.message];
        }
      });
      setEditingMessageId(null);
      setNewMessage("");
      scrollToForm();
      console.log("メッセージを送信しました: ", data.message);

      markMessageAsRead(data.message.id);
    } catch (error) {
      console.error("送信エラーが発生しました:", error);
    }
  };

  const handleEdit = (messageId: number, currentContent: string) => {
    setNewMessage(currentContent);
    setEditingMessageId(messageId);
    inputRef.current?.focus();
    scrollToForm();
  };

  const handleCancel = () => {
    setNewMessage("");
    setEditingMessageId(null);
  };

  const handleDelete = async (messageId: number) => {
    const confirmDelete = window.confirm("本当に削除しますか？");
    if (confirmDelete) {
      try {
        await fetch(
          `http://localhost:3000/groups/${groupId}/messages/${messageId}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );
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

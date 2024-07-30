import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { DirectMessage } from "../types/componentTypes";
import useAuth from "../hooks/useAuth";
import "../styles/ChatStyles.css";
import { createConsumer, Subscription } from "@rails/actioncable";
import MessageList from "./MessageList";
import MessageForm from "./MessageForm";
import { useMessageContext } from "../context/MessageContext";

const DirectMessageDetail: React.FC = () => {
  const { messageId } = useParams<{ messageId: string }>();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const { user, isAuthenticated, isLoading } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setNewDirectMessages } = useMessageContext();

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

  const fetchDirectMessages = useCallback(async () => {
    if (!messageId) return;
    try {
      const response = await fetch(
        `http://localhost:3000/direct_messages/${messageId}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(
          `ネットワーク応答が正常ではありません: ${response.statusText}`
        );
      }
      const data = await response.json();
      console.log("取得したメッセージ:", data.direct_messages);
      const filteredMessages = data.direct_messages.filter(
        (msg: DirectMessage) =>
          msg && msg.content !== undefined && msg.content !== null
      );
      setMessages(filteredMessages);
      scrollToBottom();
      // 新着メッセージフラグをクリアする
      setNewDirectMessages((prevNewMessages) => {
        const updatedNewMessages = { ...prevNewMessages };
        delete updatedNewMessages[Number(messageId)];
        return updatedNewMessages;
      });
    } catch (error) {
      console.error("フェッチ操作に問題が発生しました:", error);
      setMessages([]);
    }
  }, [messageId, setNewDirectMessages]);

  const clearNewMessageFlag = async (senderId: number) => {
    try {
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
    } catch (error) {
      console.error("新着メッセージのクリアに失敗しました:", error);
    }
  };

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user || !messageId) {
      console.error(
        "認証ステータス、ユーザー、またはメッセージIDが欠落しています:",
        {
          isAuthenticated,
          user,
          messageId,
        }
      );
      return;
    }

    fetchDirectMessages();

    const cable = createConsumer("ws://localhost:3000/cable");

    const subscription: Partial<Subscription> = {
      received(data: { direct_message: DirectMessage; action?: string }) {
        console.log("WebSocket経由でメッセージを受信:", data);
        if (!data.direct_message || !data.direct_message.content) {
          console.error("無効なメッセージを受信しました:", data);
          return;
        }
        setMessages((prevMessages) => {
          if (data.action === "delete") {
            return prevMessages.filter(
              (msg) => msg.id !== data.direct_message.id
            );
          } else if (data.action === "update") {
            return prevMessages.map((msg) =>
              msg.id === data.direct_message.id ? data.direct_message : msg
            );
          } else if (
            data.action === "create" &&
            !prevMessages.find((msg) => msg.id === data.direct_message.id)
          ) {
            return [...prevMessages, data.direct_message];
          }
          return prevMessages;
        });
        scrollToForm();
        // 新着メッセージフラグをクリアする
        clearNewMessageFlag(data.direct_message.sender_id);
      },
      connected() {
        console.log("DirectMessagesChannelに接続されました");
      },
      disconnected() {
        console.log("DirectMessagesChannelから切断されました");
      },
    };

    const channel = cable.subscriptions.create(
      { channel: "DirectMessagesChannel", user_id: user.id.toString() },
      subscription as Subscription
    );

    return () => {
      channel.unsubscribe();
    };
  }, [
    fetchDirectMessages,
    isAuthenticated,
    isLoading,
    user,
    messageId,
    setNewDirectMessages,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") {
      alert("メッセージを入力してください");
      return;
    }

    // メッセージを編集する場合
    if (editingMessageId !== null) {
      try {
        const response = await fetch(
          `http://localhost:3000/direct_messages/${editingMessageId}`,
          {
            method: "PUT",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              direct_message: {
                content: newMessage,
              },
            }),
          }
        );
        if (!response.ok) {
          const text = await response.text();
          throw new Error(
            `ネットワーク応答が正常ではありません: ${response.statusText}\n${text}`
          );
        }
        const data = await response.json();
        console.log("メッセージが更新されました:", data);
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === editingMessageId
              ? { ...msg, content: data.direct_message.content, edited: true }
              : msg
          )
        );
        setEditingMessageId(null);
        setNewMessage("");
        scrollToBottom();
      } catch (error) {
        console.error("メッセージの編集に問題が発生しました:", error);
      }
    } else {
      // 新しいメッセージを送信する場合
      if (messages.length === 0) {
        console.error(
          "メッセージが利用できないため、受信者IDを判断できません。"
        );
        return;
      }

      const recipientId =
        messages[0].recipient_id === user?.id
          ? messages[0].sender_id
          : messages[0].recipient_id;

      try {
        const response = await fetch("http://localhost:3000/direct_messages", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            direct_message: {
              recipient_id: recipientId,
              content: newMessage,
            },
          }),
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(
            `ネットワーク応答が正常ではありません: ${response.statusText}\n${text}`
          );
        }
        const data = await response.json();
        console.log("メッセージが送信されました:", data);
        setNewMessage("");
        scrollToBottom();
      } catch (error) {
        console.error("フェッチ操作に問題が発生しました:", error);
      }
    }
  };

  const handleEdit = (messageId: number, currentContent: string) => {
    setEditingMessageId(messageId);
    setNewMessage(currentContent);
    inputRef.current?.focus();
  };

  const handleCancel = () => {
    setEditingMessageId(null);
    setNewMessage("");
  };

  const handleDelete = async (messageId: number) => {
    if (window.confirm("このメッセージを削除してもよろしいですか？")) {
      try {
        const response = await fetch(
          `http://localhost:3000/direct_messages/${messageId}`,
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
          throw new Error(
            `ネットワーク応答が正常ではありません: ${response.statusText}\n${text}`
          );
        }
        setMessages((prevMessages) =>
          prevMessages.filter((msg) => msg.id !== messageId)
        );
      } catch (error) {
        console.error("メッセージの削除に問題が発生しました:", error);
      }
    }
  };

  // ローディング中の場合の表示
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // 認証情報が不足している場合の表示
  if (!isAuthenticated || !user || !messageId) {
    return <div>Loading...</div>;
  }

  // メッセージリストとメッセージ入力フォームを表示
  return (
    <div>
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
        handleCancel={handleCancel}
        formRef={formRef}
        inputRef={inputRef}
        editingMessageId={editingMessageId}
      />
      <div ref={messagesEndRef} />
    </div>
  );
};

export default DirectMessageDetail;

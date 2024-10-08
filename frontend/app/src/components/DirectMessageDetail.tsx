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

  // フェッチしてメッセージを取得
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
      const filteredMessages = data.direct_messages.filter(
        (msg: DirectMessage) =>
          msg && msg.content !== undefined && msg.content !== null
      );
      setMessages(filteredMessages);
      scrollToBottom();
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

  // 既読フラグをクリア
  const clearNewMessageFlag = useCallback(
    async (senderId: number) => {
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
    },
    [setNewDirectMessages]
  );

  // リアルタイムで既読情報を受信してマージ
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
        console.log("受信データ: ", data);

        if (!data.direct_message || !data.direct_message.content) {
          console.error("無効なメッセージを受信しました:", data);
          return;
        }

        switch (data.action) {
          case "create":
            setMessages((prevMessages) => [
              ...prevMessages,
              data.direct_message,
            ]);
            break;

          case "update_read_status":
            // 既読情報をリアルタイムで反映させる
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.id === data.direct_message.id
                  ? {
                      ...msg,
                      ...data.direct_message, // 新しい既読情報をマージ
                      is_read: true, // 既読ステータスを強制的に更新
                    }
                  : msg
              )
            );
            break;

          case "delete":
            setMessages((prevMessages) =>
              prevMessages.filter((msg) => msg.id !== data.direct_message.id)
            );
            break;

          default:
            console.warn("未知のアクション:", data.action);
        }

        scrollToForm();

        // 新着メッセージフラグをクリア
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
    clearNewMessageFlag,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") {
      alert("メッセージを入力してください");
      return;
    }

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user || !messageId) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <MessageList
        messages={messages}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        user={user}
        chatType="direct"
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

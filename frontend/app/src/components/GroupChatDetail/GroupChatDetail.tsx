import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Group, Message } from "../../types/componentTypes";
import useAuth from "../../hooks/useAuth";
import {
  createConsumer,
  ChannelNameWithParams,
  Subscription,
} from "@rails/actioncable";
import MessageList from "./MessageList";
import MessageForm from "./MessageForm";
import "../../styles/ChatStyles.css";

const GroupChatDetail: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const { user } = useAuth();
  const formRef = useRef<HTMLFormElement | null>(null); // フォームの参照

  useEffect(() => {
    fetch(`http://localhost:3000/groups/${groupId}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("ネットワーク応答が正常ではありません");
        }
        return response.json();
      })
      .then((data) => {
        setGroup(data.group);
        setMessages(data.messages);
        console.log("グループとメッセージを取得しました: ", data);
        if (data.group.new_messages) {
          clearNewMessages();
        }
        formRef.current?.scrollIntoView({ behavior: "smooth" }); // フォームにスクロール
      })
      .catch((error) => {
        console.error("フェッチ操作に問題がありました:", error);
      });

    const cable = createConsumer("ws://localhost:3000/cable");

    const channelParams: ChannelNameWithParams = {
      channel: "MessageChannel",
      chat_room_type: "group",
      chat_room_id: groupId,
    };

    const subscription: Partial<Subscription> = {
      received(data: {
        message: Message;
        message_id?: number;
        action?: string;
      }) {
        console.log("メッセージを受信しました: ", data);

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
        formRef.current?.scrollIntoView({ behavior: "smooth" }); // フォームにスクロール
      },
      connected() {
        console.log("チャンネルに接続しました");
      },
      disconnected() {
        console.log("チャンネルから切断されました");
      },
    };

    const channel = cable.subscriptions.create(
      channelParams,
      subscription as Subscription
    );

    return () => {
      channel.unsubscribe();
    };
  }, [groupId]);

  const clearNewMessages = () => {
    fetch(`http://localhost:3000/groups/${groupId}/clear_new_messages`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("ネットワーク応答が正常ではありません");
        }
        return response.json();
      })
      .then((data) => {
        console.log("新着メッセージをクリアしました: ", data);
      })
      .catch((error) => {
        console.error("フェッチ操作に問題がありました:", error);
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newMessage.trim() === "") {
      alert("メッセージを入力してください");
      return;
    }

    if (editingMessageId !== null) {
      fetch(
        `http://localhost:3000/groups/${groupId}/messages/${editingMessageId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: newMessage }),
        }
      )
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(text);
            });
          }
          return response.json();
        })
        .then(() => {
          setEditingMessageId(null);
          setNewMessage("");
          formRef.current?.scrollIntoView({ behavior: "smooth" }); // フォームにスクロール
          console.log("メッセージを編集しました");
        })
        .catch((error) => {
          console.error("フェッチ操作に問題がありました:", error);
        });
    } else {
      fetch(`http://localhost:3000/groups/${groupId}/create_message`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newMessage }),
      })
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(text);
            });
          }
          return response.json();
        })
        .then(() => {
          setNewMessage("");
          formRef.current?.scrollIntoView({ behavior: "smooth" }); // フォームにスクロール
          console.log("メッセージを送信しました");
        })
        .catch((error) => {
          console.error("フェッチ操作に問題がありました:", error);
        });
    }
  };

  const handleEdit = (messageId: number, currentContent: string) => {
    setEditingMessageId(messageId);
    setNewMessage(currentContent);
    formRef.current?.scrollIntoView({ behavior: "smooth" }); // フォームにスクロール
  };

  const handleDelete = (messageId: number) => {
    if (window.confirm("このメッセージを削除してもよろしいですか？")) {
      fetch(`http://localhost:3000/groups/${groupId}/messages/${messageId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(text);
            });
          }
          console.log("メッセージを削除しました");
        })
        .catch((error) => {
          console.error("削除操作に問題がありました:", error);
        });
    }
  };

  if (!group) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      <h1>{group.name}</h1>
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
      />
    </div>
  );
};

export default GroupChatDetail;

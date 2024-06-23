import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Group, Message } from "../types/componentTypes";
import useAuth from "../hooks/useAuth";
import "../styles/ChatStyles.css";
import {
  createConsumer,
  ChannelNameWithParams,
  Subscription,
} from "@rails/actioncable";

const GroupChatDetail: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const { user } = useAuth(); // 現在のユーザー情報を取得
  const formRef = useRef<HTMLFormElement | null>(null); // メッセージフォームを参照

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
        console.log("グループとメッセージを取得しました: ", data); // デバッグ用ログ
        scrollToForm();
      })
      .catch((error) => {
        console.error("フェッチ操作に問題がありました:", error);
      });

    // Action Cableの設定
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
        console.log("メッセージを受信しました: ", data); // 受信確認

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
              // 既存のメッセージを更新
              const updatedMessages = [...prevMessages];
              updatedMessages[existingIndex] = data.message;
              return updatedMessages;
            } else {
              // 新しいメッセージを追加
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
      channelParams,
      subscription as Subscription
    );

    // コンポーネントのアンマウント時にチャネルから退会
    return () => {
      channel.unsubscribe();
    };
  }, [groupId]);

  // メッセージ送信ハンドラー
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingMessageId !== null) {
      // メッセージの編集
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
          console.log("メッセージを編集しました"); // デバッグ用ログ
          scrollToForm();
        })
        .catch((error) => {
          console.error("フェッチ操作に問題がありました:", error);
        });
    } else {
      // 新しいメッセージをサーバーに送信
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
          console.log("メッセージを送信しました"); // デバッグ用ログ
          scrollToForm();
        })
        .catch((error) => {
          console.error("フェッチ操作に問題がありました:", error);
        });
    }
  };

  // メッセージ編集開始ハンドラー
  const handleEdit = (messageId: number, currentContent: string) => {
    setEditingMessageId(messageId);
    setNewMessage(currentContent); // フォームに編集対象のメッセージを表示
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // メッセージ削除ハンドラー
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
          console.log("メッセージを削除しました"); // デバッグ用ログ
          scrollToForm();
        })
        .catch((error) => {
          console.error("削除操作に問題がありました:", error);
        });
    }
  };

  // メッセージフォームまでスクロール
  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // グループ情報が読み込まれていない場合のローディング表示
  if (!group) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      <h1>{group.name}</h1>
      <ul>
        {messages.map((message, index) => {
          const messageClass =
            message.sender_name === user?.name ? "left" : "right";
          return (
            <li
              key={`${message.id}-${index}`}
              className={`message ${messageClass}`}
            >
              <div className="content">
                <strong>{message.sender_name}</strong> ({message.created_at}):{" "}
                {message.content}
                {message.sender_name === user?.name && (
                  <>
                    <button
                      onClick={() => handleEdit(message.id, message.content)}
                    >
                      編集
                    </button>
                    <button
                      className="delete"
                      onClick={() => handleDelete(message.id)}
                    >
                      削除
                    </button>
                  </>
                )}
                {message.edited && <span>(編集済)</span>}
              </div>
            </li>
          );
        })}
      </ul>
      <form className="form-container" onSubmit={handleSubmit} ref={formRef}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="メッセージを入力してください..."
        />
        <button type="submit">
          {editingMessageId !== null ? "更新" : "送信"}
        </button>
      </form>
    </div>
  );
};

export default GroupChatDetail;

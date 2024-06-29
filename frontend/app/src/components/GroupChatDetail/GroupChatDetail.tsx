import React, { useEffect, useState, useRef, useCallback } from "react";
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
import { useMessageContext } from "../../context/MessageContext";

const GroupChatDetail: React.FC = () => {
  // URLパラメータからグループIDを取得
  const { groupId } = useParams<{ groupId: string }>();

  // 状態管理
  const [group, setGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);

  // 認証情報とメッセージコンテキストを取得
  const { user } = useAuth();
  const { setNewMessages } = useMessageContext();

  // フォームと入力フィールドの参照を保持
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // 新着メッセージフラグをクリアする関数
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

      // コンテキストのnewMessagesも更新
      setNewMessages((prevNewMessages: { [key: number]: boolean }) => {
        const updatedNewMessages = { ...prevNewMessages };
        delete updatedNewMessages[Number(groupId)];
        return updatedNewMessages;
      });
    } catch (error) {
      console.error("フェッチ操作に問題がありました:", error);
    }
  }, [groupId, setNewMessages]);

  // フォームまでスクロールし、入力フィールドにフォーカスを設定
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
    inputRef.current?.focus();
  };

  // グループデータを取得する関数
  const fetchGroupData = async () => {
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
      console.log("グループとメッセージを取得しました: ", data);
      if (data.group.new_messages) {
        await clearNewMessages();
      }
      scrollToForm();
    } catch (error) {
      console.error("フェッチ操作に問題がありました:", error);
    }
  };

  // コンポーネントの初期化時およびgroupIdの変更時に実行される
  useEffect(() => {
    fetchGroupData();

    // Action Cableの設定
    const cable = createConsumer("ws://localhost:3000/cable");

    const channelParams: ChannelNameWithParams = {
      channel: "MessageChannel",
      chat_room_type: "group",
      chat_room_id: groupId,
    };

    // サブスクリプションの設定
    const subscription: Partial<Subscription> = {
      // メッセージ受信時の処理
      received(data: {
        message: Message;
        message_id?: number;
        action?: string;
      }) {
        console.log("メッセージを受信しました: ", data);

        // メッセージ削除の処理
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
        clearNewMessages(); // メッセージを受信した際にも新着フラグをクリア
        scrollToForm(); // フォームへスクロール
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

    // コンポーネントのクリーンアップ時にサブスクリプションを解除
    return () => {
      channel.unsubscribe();
    };
  }, [groupId, clearNewMessages]);

  // メッセージ送信処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newMessage.trim() === "") {
      alert("メッセージを入力してください");
      return;
    }

    if (editingMessageId !== null) {
      // メッセージ編集の処理
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
      // 新規メッセージ送信の処理
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

  // メッセージ編集のためにフォームをセット
  const handleEdit = (messageId: number, currentContent: string) => {
    setEditingMessageId(messageId);
    setNewMessage(currentContent);
    scrollToForm();
  };

  // メッセージ削除処理
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

  // グループ情報がロードされていない場合の処理
  if (!group) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      {/* グループ名を表示 */}
      <h1>{group.name}</h1>

      {/* メッセージリストコンポーネントを表示 */}
      <MessageList
        messages={messages} // メッセージの配列を渡す
        handleEdit={handleEdit} // メッセージ編集用の関数を渡す
        handleDelete={handleDelete} // メッセージ削除用の関数を渡す
        user={user} // 現在のユーザー情報を渡す
      />

      {/* メッセージフォームコンポーネントを表示 */}
      <MessageForm
        newMessage={newMessage} // 新規メッセージの内容を渡す
        setNewMessage={setNewMessage} // 新規メッセージを設定する関数を渡す
        handleSubmit={handleSubmit} // メッセージ送信用の関数を渡す
        formRef={formRef} // フォームの参照を渡す
        inputRef={inputRef} // 入力フィールドの参照を渡す
      />
    </div>
  );
};

export default GroupChatDetail;

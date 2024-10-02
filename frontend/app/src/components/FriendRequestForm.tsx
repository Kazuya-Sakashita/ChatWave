import React, { useEffect, useState } from "react";
import useFriendApi from "../hooks/useFriendApi"; // フレンドAPIを使用
import "../components/FriendRequestForm.css"; // デザイン用CSSファイル

// ユーザーの型定義
interface User {
  id: number;
  name: string;
}

const FriendRequestForm: React.FC = () => {
  const { sendFriendRequest } = useFriendApi(); // フレンド申請送信用のAPI呼び出し
  const [users, setUsers] = useState<User[]>([]); // ユーザーリストを保持する状態
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null); // 選択されたユーザーID
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ユーザー一覧を取得する
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:3000/users", {
        credentials: "include", // 認証情報を含める
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data); // ユーザーリストをセット
      } else {
        setError("ユーザー一覧の取得に失敗しました。");
      }
    } catch (error) {
      setError("サーバーとの通信に失敗しました。");
    }
  };

  useEffect(() => {
    fetchUsers(); // コンポーネントがロードされたときにユーザーリストを取得
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedUserId) {
      setError("フレンドを選択してください。");
      return;
    }

    try {
      const response = await sendFriendRequest(selectedUserId); // フレンド申請送信
      console.log("フレンド申請送信成功:", response);
      setSuccess("フレンド申請を送信しました。");

      // フレンド申請が成功したら、申請したユーザーをリストから削除
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== selectedUserId)
      );
      setSelectedUserId(null); // フォームをクリア
    } catch (error: any) {
      console.error("フレンド申請送信エラー:", error);
      setError("フレンド申請に失敗しました。");
    }
  };

  return (
    <div className="friend-request-form-container">
      <h2>フレンド申請を送る</h2>
      <form onSubmit={handleSubmit} className="friend-request-form">
        <div className="form-group">
          <label htmlFor="userSelect">フレンドを選択してください:</label>
          <select
            id="userSelect"
            value={selectedUserId ?? ""}
            onChange={(e) => setSelectedUserId(Number(e.target.value))}
          >
            <option value="">-- ユーザーを選択 --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="submit-button">
          フレンド申請を送る
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
    </div>
  );
};

export default FriendRequestForm;

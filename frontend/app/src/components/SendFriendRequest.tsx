import React, { useEffect, useState } from "react";
import useFriendApi from "../hooks/useFriendApi";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  name: string;
}

const SendFriendRequest: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { sendFriendRequest } = useFriendApi(); // フレンド申請APIフックを使用
  const navigate = useNavigate();

  // ユーザー一覧を取得
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:3000/users", {
          credentials: "include", // 認証情報を含める
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          setError("ユーザー一覧の取得に失敗しました。");
        }
      } catch (error) {
        setError("サーバーとの通信に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // フレンド申請を送信する処理
  const handleSendRequest = async () => {
    if (selectedUser === null) {
      alert("ユーザーを選択してください。");
      return;
    }
    try {
      await sendFriendRequest(selectedUser);
      alert("フレンド申請を送信しました。");
      navigate("/friends"); // 送信後にフレンド一覧にリダイレクト
    } catch (error) {
      setError("フレンド申請の送信に失敗しました。");
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>フレンド申請を送る</h2>
      <div>
        <label htmlFor="userSelect">ユーザーを選択してください:</label>
        <select
          id="userSelect"
          value={selectedUser ?? ""}
          onChange={(e) => setSelectedUser(Number(e.target.value))}
        >
          <option value="">-- ユーザーを選択 --</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleSendRequest}>フレンド申請を送る</button>
    </div>
  );
};

export default SendFriendRequest;

import React, { useEffect, useState } from "react";
import useFriendApi from "../hooks/useFriendApi";
import { useNavigate } from "react-router-dom";
import { User, PendingFriendRequest } from "../types/componentTypes"; // 型をインポート
import "../components/SendFriendRequest.css"; // デザイン用CSSを読み込み

const SendFriendRequest: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [pendingRequests, setPendingRequests] = useState<number[]>([]); // 承認待ちのユーザーリスト
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { sendFriendRequest, getPendingFriendRequests } = useFriendApi(); // フレンド申請APIフックを使用
  const navigate = useNavigate();

  // 承認待ちユーザーの取得とユーザー一覧の取得
  useEffect(() => {
    const fetchUsersAndPendingRequests = async () => {
      try {
        // 承認待ちフレンドリクエストの取得
        const pendingRequestsResponse: PendingFriendRequest[] =
          await getPendingFriendRequests();
        const pendingIds = pendingRequestsResponse.map(
          (request: PendingFriendRequest) => request.recipient_id
        );
        setPendingRequests(pendingIds); // 承認待ちリストをセット

        // 全ユーザーの取得
        const response = await fetch("http://localhost:3000/users", {
          credentials: "include", // 認証情報を含める
        });
        if (response.ok) {
          const data: User[] = await response.json();
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

    fetchUsersAndPendingRequests();
  }, [getPendingFriendRequests]);

  // フレンド申請を送信する処理
  const handleSendRequest = async () => {
    if (selectedUser === null) {
      alert("ユーザーを選択してください。");
      return;
    }
    try {
      await sendFriendRequest(selectedUser);
      alert("フレンド申請を送信しました。");

      // 申請したユーザーを承認待ちリストに追加
      setPendingRequests((prev) => [...prev, selectedUser]);

      // フレンド申請後、リストから削除
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== selectedUser)
      );
      setSelectedUser(null); // 選択状態をクリア
      navigate("/friends"); // フレンド一覧にリダイレクト
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
      <div className="user-list">
        {/* 承認待ちではないユーザーのみを表示 */}
        {users
          .filter((user) => !pendingRequests.includes(user.id)) // 承認待ちのユーザーを除外
          .map((user) => (
            <div
              key={user.id}
              className={`user-card ${
                selectedUser === user.id ? "selected" : ""
              }`} // カードが選択された状態を表示
              onClick={() => setSelectedUser(user.id)} // ユーザーを選択
            >
              <img
                src={user.avatar_url || "/default-avatar.png"} // アバター画像
                alt={user.name}
                className="user-avatar"
              />
              <p className="user-name">{user.name}</p>
            </div>
          ))}
      </div>
      <button
        onClick={handleSendRequest}
        className="submit-button"
        disabled={!selectedUser} // ユーザーが選択されていない場合はボタンを無効化
      >
        フレンド申請を送る
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default SendFriendRequest;

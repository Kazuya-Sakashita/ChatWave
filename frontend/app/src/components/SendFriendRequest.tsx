import React, { useEffect, useState } from "react";
import useFriendApi from "../hooks/useFriendApi";
import { useNavigate } from "react-router-dom";
import { User, PendingFriendRequest } from "../types/componentTypes";
import "../components/SendFriendRequest.css";

const SendFriendRequest: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [pendingRequests, setPendingRequests] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { sendFriendRequest, getPendingFriendRequests } = useFriendApi();
  const navigate = useNavigate();

  // 承認待ちユーザーの取得とユーザー一覧の取得
  useEffect(() => {
    const fetchUsersAndPendingRequests = async () => {
      try {
        const pendingRequestsResponse: PendingFriendRequest[] =
          await getPendingFriendRequests();
        const pendingIds = pendingRequestsResponse.map(
          (request: PendingFriendRequest) => request.recipient_id
        );
        setPendingRequests(pendingIds);

        const response = await fetch("http://localhost:3000/users", {
          credentials: "include",
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

  // ユーザーの選択または選択解除を行う関数
  const toggleSelectUser = (userId: number) => {
    if (selectedUser === userId) {
      // すでに選択されている場合、選択を解除
      setSelectedUser(null);
    } else {
      // 選択
      setSelectedUser(userId);
    }
  };

  // フレンド申請を送信する処理
  const handleSendRequest = async () => {
    if (selectedUser === null) {
      alert("ユーザーを選択してください。");
      return;
    }
    try {
      await sendFriendRequest(selectedUser);
      alert("フレンド申請を送信しました。");

      setPendingRequests((prev) => [...prev, selectedUser]);
      setUsers((prevUsers) =>
        prevUsers.filter((user) => user.id !== selectedUser)
      );
      setSelectedUser(null);
      navigate("/friends");
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
    <div className="friend-request-container">
      <h2>フレンド申請を送る</h2>
      <div className="user-list-container">
        <div className="user-list">
          {users
            .filter((user) => !pendingRequests.includes(user.id))
            .map((user) => (
              <div
                key={user.id}
                className={`user-card ${
                  selectedUser === user.id ? "selected" : ""
                }`}
                onClick={() => toggleSelectUser(user.id)}
              >
                <img
                  src={user.avatar_url || "/default-avatar.png"}
                  alt={user.name}
                  className="user-avatar"
                />
                <p className="user-name">{user.name}</p>
              </div>
            ))}
        </div>
      </div>
      <button
        onClick={handleSendRequest}
        className="submit-button"
        disabled={!selectedUser}
      >
        フレンド申請を送る
      </button>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default SendFriendRequest;

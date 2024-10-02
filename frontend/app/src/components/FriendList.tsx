import React, { useEffect, useState } from "react";
import useFriendApi from "../hooks/useFriendApi";
import { Friend } from "../types/componentTypes";
import "../components/FriendList.css"; // デザイン用のCSSファイルを読み込み

const FriendList: React.FC = () => {
  const { getFriends, respondToFriendRequest } = useFriendApi(); // respondToFriendRequest を追加
  const [confirmedFriends, setConfirmedFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // フレンド情報を取得してセット
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const fetchedData = await getFriends();
        console.log("Fetched Friends:", fetchedData);

        // 確認済みフレンドと申請中のフレンドをセット
        setConfirmedFriends(fetchedData.confirmed_friends);
        setPendingRequests(fetchedData.pending_requests);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("フレンド一覧の取得に失敗しました。");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [getFriends]);

  // フレンド承認処理
  const handleAccept = async (friendId: number) => {
    try {
      const response = await respondToFriendRequest(friendId, "accept");
      console.log("承認成功:", response);

      // 承認成功後、該当フレンドを承認済みリストに移動
      const acceptedFriend = pendingRequests.find((req) => req.id === friendId);
      if (acceptedFriend) {
        setConfirmedFriends((prev) => [...prev, acceptedFriend]);
        setPendingRequests((prev) =>
          prev.filter((request) => request.id !== friendId)
        );
      }
    } catch (error) {
      console.error("フレンド申請の承認に失敗しました。", error);
    }
  };

  // フレンド拒否処理
  const handleReject = async (friendId: number) => {
    try {
      const response = await respondToFriendRequest(friendId, "reject");
      console.log("拒否成功:", response);

      // 拒否成功後、該当フレンドを申請リストから削除
      setPendingRequests((prev) =>
        prev.filter((request) => request.id !== friendId)
      );
    } catch (error) {
      console.error("フレンド申請の拒否に失敗しました。", error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="friend-list-container">
      <h2 className="friend-list-title">フレンド一覧</h2>

      <h3 className="friend-list-subtitle">承認済みのフレンド</h3>
      <ul className="friend-list">
        {confirmedFriends.length > 0 ? (
          confirmedFriends.map((friend) => (
            <li key={friend.id} className="friend-list-item">
              <div className="friend-info">
                <p className="friend-name">名前: {friend.name}</p>
                <p className="friend-email">Email: {friend.email}</p>
              </div>
            </li>
          ))
        ) : (
          <p className="no-friends-message">承認済みのフレンドがいません。</p>
        )}
      </ul>

      <h3 className="friend-list-subtitle">フレンド申請中</h3>
      <ul className="friend-list">
        {pendingRequests.length > 0 ? (
          pendingRequests.map((request) => (
            <li key={request.id} className="friend-list-item">
              <div className="friend-info">
                <p className="friend-name">名前: {request.name}</p>
                <p className="friend-email">Email: {request.email}</p>
              </div>
              <div className="friend-actions">
                <button
                  className="friend-button accept"
                  onClick={() => handleAccept(request.id)}
                >
                  承認
                </button>
                <button
                  className="friend-button reject"
                  onClick={() => handleReject(request.id)}
                >
                  拒否
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="no-friends-message">フレンド申請がありません。</p>
        )}
      </ul>
    </div>
  );
};

export default FriendList;

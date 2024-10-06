import React, { useEffect, useState, useCallback } from "react";
import useFriendApi from "../hooks/useFriendApi";
import { Friend } from "../types/componentTypes";
import "../components/FriendList.css"; // デザイン用のCSSファイルを読み込み

const FriendList: React.FC = () => {
  const {
    getFriends,
    getBlockedFriends,
    respondToFriendRequest,
    blockFriend,
    unblockFriend,
  } = useFriendApi();

  const [confirmedFriends, setConfirmedFriends] = useState<Friend[]>([]);
  const [pendingRequestsSent, setPendingRequestsSent] = useState<Friend[]>([]); // 送信したフレンド申請
  const [pendingRequestsReceived, setPendingRequestsReceived] = useState<
    Friend[]
  >([]); // 受け取ったフレンド申請
  const [blockedFriends, setBlockedFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // フレンド情報を取得してセット
  const fetchFriends = useCallback(async () => {
    try {
      const fetchedData = await getFriends();
      const blockedData = await getBlockedFriends();

      console.log("Fetched Friends Data:", fetchedData);
      console.log("Fetched Blocked Friends Data:", blockedData);

      setConfirmedFriends(fetchedData.confirmed_friends || []);
      setPendingRequestsSent(fetchedData.pending_requests_sent || []);
      setPendingRequestsReceived(fetchedData.pending_requests_received || []);
      setBlockedFriends(blockedData || []);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching friends:", error.message);
        setError(error.message);
      } else {
        console.error("Unknown error fetching friends");
        setError("フレンド一覧の取得に失敗しました。");
      }
    } finally {
      setLoading(false);
    }
  }, [getFriends, getBlockedFriends]);

  useEffect(() => {
    console.log("Fetching friends on component mount...");
    fetchFriends();
  }, [fetchFriends]);

  // フレンド申請キャンセル処理（送信した申請）
  const handleCancelRequest = async (friendId: number) => {
    try {
      await respondToFriendRequest(friendId, "cancel");
      fetchFriends(); // リストをリアルタイム更新
    } catch (error) {
      console.error("フレンド申請のキャンセルに失敗しました。", error);
    }
  };

  // フレンド承認処理（受け取った申請）
  const handleAccept = async (friendId: number) => {
    try {
      await respondToFriendRequest(friendId, "accept");
      fetchFriends(); // リストをリアルタイム更新
    } catch (error) {
      console.error("フレンド申請の承認に失敗しました。", error);
    }
  };

  // フレンド拒否処理（受け取った申請）
  const handleReject = async (friendId: number) => {
    try {
      await respondToFriendRequest(friendId, "reject");
      fetchFriends(); // リストをリアルタイム更新
    } catch (error) {
      console.error("フレンド申請の拒否に失敗しました。", error);
    }
  };

  // ブロック処理
  const handleBlock = async (friendId: number) => {
    try {
      await blockFriend(friendId);
      fetchFriends(); // ブロック後にリストをリアルタイム更新
    } catch (error) {
      console.error("フレンドのブロックに失敗しました。", error);
    }
  };

  // ブロック解除処理
  const handleUnblock = async (friendId: number) => {
    try {
      await unblockFriend(friendId);
      fetchFriends(); // ブロック解除後にリストをリアルタイム更新
    } catch (error) {
      console.error("ブロック解除に失敗しました。", error);
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
            <li key={`confirmed-${friend.id}`} className="friend-list-item">
              <div className="friend-info">
                <p className="friend-name">名前: {friend.name}</p>
                <p className="friend-email">Email: {friend.email}</p>
              </div>
              <div className="friend-actions">
                <button
                  className="friend-button block"
                  onClick={() => handleBlock(friend.id)}
                >
                  ブロック
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="no-friends-message">承認済みのフレンドがいません。</p>
        )}
      </ul>

      <h3 className="friend-list-subtitle">送信したフレンド申請</h3>
      <ul className="friend-list">
        {pendingRequestsSent.length > 0 ? (
          pendingRequestsSent.map((request) => (
            <li key={`sent-${request.id}`} className="friend-list-item">
              <div className="friend-info">
                <p className="friend-name">名前: {request.name}</p>
              </div>
              <div className="friend-actions">
                <button
                  className="friend-button cancel"
                  onClick={() => handleCancelRequest(request.id)}
                >
                  申請をキャンセル
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="no-friends-message">
            送信したフレンド申請がありません。
          </p>
        )}
      </ul>

      <h3 className="friend-list-subtitle">受け取ったフレンド申請</h3>
      <ul className="friend-list">
        {pendingRequestsReceived.length > 0 ? (
          pendingRequestsReceived.map((request) => (
            <li key={`received-${request.id}`} className="friend-list-item">
              <div className="friend-info">
                <p className="friend-name">名前: {request.name}</p>
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
          <p className="no-friends-message">
            受け取ったフレンド申請がありません。
          </p>
        )}
      </ul>

      <h3 className="friend-list-subtitle">ブロックしたフレンド</h3>
      <ul className="friend-list">
        {blockedFriends.length > 0 ? (
          blockedFriends.map((friend) => (
            <li key={`blocked-${friend.id}`} className="friend-list-item">
              <div className="friend-info">
                <p className="friend-name">名前: {friend.name}</p>
                <p className="friend-email">Email: {friend.email}</p>
              </div>
              <div className="friend-actions">
                <button
                  className="friend-button unblock"
                  onClick={() => handleUnblock(friend.id)}
                >
                  ブロック解除
                </button>
              </div>
            </li>
          ))
        ) : (
          <p className="no-friends-message">ブロックしたフレンドがいません。</p>
        )}
      </ul>
    </div>
  );
};

export default FriendList;

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
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
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

      setConfirmedFriends(fetchedData.confirmed_friends);
      setPendingRequests(fetchedData.pending_requests);
      setBlockedFriends(blockedData);
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

  // フレンド承認処理
  const handleAccept = async (friendId: number) => {
    try {
      console.log("Accepting friend request with ID:", friendId);
      const response = await respondToFriendRequest(friendId, "accept");
      console.log("Friend request accepted:", response);

      const acceptedFriend = pendingRequests.find((req) => req.id === friendId);
      if (acceptedFriend) {
        console.log("Accepted Friend:", acceptedFriend);
        setConfirmedFriends((prev) => [...prev, acceptedFriend]);
        setPendingRequests((prev) =>
          prev.filter((request) => request.id !== friendId)
        );
      }
      await fetchFriends(); // 最新のデータをフェッチ
    } catch (error) {
      console.error("フレンド申請の承認に失敗しました。", error);
    }
  };

  // フレンド拒否処理
  const handleReject = async (friendId: number) => {
    try {
      console.log("Rejecting friend request with ID:", friendId);
      await respondToFriendRequest(friendId, "reject");
      setPendingRequests((prev) =>
        prev.filter((request) => request.id !== friendId)
      );
      console.log("Friend request rejected for ID:", friendId);
      await fetchFriends(); // 最新のデータをフェッチ
    } catch (error) {
      console.error("フレンド申請の拒否に失敗しました。", error);
    }
  };

  // フレンドブロック処理
  const handleBlock = async (friendId: number) => {
    try {
      console.log("Blocking Friend with ID:", friendId);
      await blockFriend(friendId);

      // 承認済みリストから削除
      const blockedFriend = confirmedFriends.find(
        (friend) => friend.id === friendId
      );
      if (blockedFriend) {
        console.log("Blocked Friend:", blockedFriend);
        setConfirmedFriends((prev) =>
          prev.filter((friend) => friend.id !== friendId)
        );
        setBlockedFriends((prev) => [...prev, blockedFriend]);
      } else {
        console.log("Could not find friend in confirmedFriends list.");
      }

      await fetchFriends(); // 最新のデータをフェッチ
    } catch (error) {
      console.error("フレンドのブロックに失敗しました。", error);
    }
  };

  // ブロック解除処理
  const handleUnblock = async (friendId: number) => {
    try {
      console.log("Unblocking Friend with ID:", friendId);
      await unblockFriend(friendId);
      setBlockedFriends((prev) =>
        prev.filter((friend) => friend.id !== friendId)
      );
      console.log("Friend unblocked. Fetching updated friends list...");
      await fetchFriends(); // 最新のデータをフェッチ
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

      <h3 className="friend-list-subtitle">フレンド申請中</h3>
      <ul className="friend-list">
        {pendingRequests.length > 0 ? (
          pendingRequests.map((request) => (
            <li key={`pending-${request.id}`} className="friend-list-item">
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

import React, { useEffect, useState, useCallback } from "react";
import useFriendApi from "../hooks/useFriendApi";
import { Friend } from "../types/componentTypes";
import "../components/FriendList.css";

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

  const fetchFriends = useCallback(async () => {
    try {
      const fetchedData = await getFriends();
      const blockedData = await getBlockedFriends();

      setConfirmedFriends(fetchedData.confirmed_friends);
      setPendingRequests(fetchedData.pending_requests);
      setBlockedFriends(blockedData);
    } catch (error: unknown) {
      setError("データの取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }, [getFriends, getBlockedFriends]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const handleAccept = async (friendId: number) => {
    try {
      await respondToFriendRequest(friendId, "accept");
      const acceptedFriend = pendingRequests.find((req) => req.id === friendId);
      if (acceptedFriend) {
        setConfirmedFriends((prev) => [...prev, acceptedFriend]);
        setPendingRequests((prev) =>
          prev.filter((request) => request.id !== friendId)
        );
      }
    } catch (error) {
      console.error("フレンド承認に失敗しました。");
    }
  };

  const handleReject = async (friendId: number) => {
    try {
      await respondToFriendRequest(friendId, "reject");
      setPendingRequests((prev) =>
        prev.filter((request) => request.id !== friendId)
      );
    } catch (error) {
      console.error("フレンド拒否に失敗しました。");
    }
  };

  const handleBlock = async (friendId: number) => {
    try {
      await blockFriend(friendId);
      const blockedFriend = confirmedFriends.find(
        (friend) => friend.id === friendId
      );
      setConfirmedFriends((prev) =>
        prev.filter((friend) => friend.id !== friendId)
      );
      if (blockedFriend) {
        setBlockedFriends((prev) => [...prev, blockedFriend]);
      }
    } catch (error) {
      console.error("ブロックに失敗しました。");
    }
  };

  const handleUnblock = async (friendId: number) => {
    try {
      await unblockFriend(friendId);
      setBlockedFriends((prev) =>
        prev.filter((friend) => friend.id !== friendId)
      );
      await fetchFriends();
    } catch (error) {
      console.error("ブロック解除に失敗しました。");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="friend-list-container">
      <h2 className="friend-list-title">フレンド一覧</h2>

      {/* 承認済みのフレンド */}
      <section className="friend-section">
        <h3 className="friend-list-subtitle">承認済みのフレンド</h3>
        <div className="friend-card-container">
          {confirmedFriends.length > 0 ? (
            confirmedFriends.map((friend) => (
              <div key={friend.id} className="friend-card">
                <img
                  src={friend.avatar_url || "/default-avatar.png"}
                  alt={friend.name}
                  className="friend-avatar"
                />
                <p className="friend-name">{friend.name}</p>
                <div className="friend-actions">
                  <button
                    className="friend-button block"
                    onClick={() => handleBlock(friend.id)}
                  >
                    ブロック
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-friends-message">フレンドがいません。</p>
          )}
        </div>
      </section>

      {/* フレンド申請中 */}
      <section className="friend-section">
        <h3 className="friend-list-subtitle">フレンド申請中</h3>
        <div className="friend-card-container">
          {pendingRequests.length > 0 ? (
            pendingRequests.map((request) => (
              <div key={request.id} className="friend-card">
                <img
                  src={request.avatar_url || "/default-avatar.png"}
                  alt={request.name}
                  className="friend-avatar"
                />
                <p className="friend-name">{request.name}</p>
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
              </div>
            ))
          ) : (
            <p className="no-friends-message">申請中のフレンドがいません。</p>
          )}
        </div>
      </section>

      {/* ブロックしたフレンド */}
      <section className="friend-section">
        <h3 className="friend-list-subtitle">ブロックしたフレンド</h3>
        <div className="friend-card-container">
          {blockedFriends.length > 0 ? (
            blockedFriends.map((friend) => (
              <div key={friend.id} className="friend-card blocked-friend">
                <img
                  src={friend.avatar_url || "/default-avatar.png"}
                  alt={friend.name}
                  className="friend-avatar blocked"
                />
                <p className="friend-name">{friend.name}</p>
                <div className="friend-actions">
                  <button
                    className="friend-button unblock"
                    onClick={() => handleUnblock(friend.id)}
                  >
                    ブロック解除
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="no-friends-message">
              ブロックしたフレンドがいません。
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default FriendList;

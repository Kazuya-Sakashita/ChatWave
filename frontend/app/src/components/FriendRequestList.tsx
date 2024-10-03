import React, { useEffect, useState } from "react";
import useFriendApi from "../hooks/useFriendApi";
import { FriendRequest } from "../types/componentTypes";
import "../components/FriendRequestList.css"; // ボタンの色変更用CSSファイルをインポート

const FriendRequestList: React.FC = () => {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<number[]>([]); // ブロックしているユーザーのIDを保持
  const { getFriendRequests, respondToFriendRequest, getBlockedFriends } =
    useFriendApi();

  useEffect(() => {
    const fetchFriendRequests = async () => {
      try {
        const requestList = await getFriendRequests();
        setRequests(requestList);
      } catch (error) {
        console.error("Failed to fetch friend requests:", error);
      }
    };

    const fetchBlockedFriends = async () => {
      try {
        const blockedList = await getBlockedFriends();
        const blockedIds = blockedList.map((friend) => friend.id);
        setBlockedUsers(blockedIds); // ブロックしたユーザーのIDを保存
      } catch (error) {
        console.error("Failed to fetch blocked friends:", error);
      }
    };

    fetchFriendRequests();
    fetchBlockedFriends();
  }, [getFriendRequests, getBlockedFriends]);

  const handleAccept = async (id: number) => {
    try {
      await respondToFriendRequest(id, "accept");
      setRequests((prevRequests) =>
        prevRequests.filter((req) => req.id !== id)
      );
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await respondToFriendRequest(id, "reject");
      setRequests((prevRequests) =>
        prevRequests.filter((req) => req.id !== id)
      );
    } catch (error) {
      console.error("Failed to reject friend request:", error);
    }
  };

  return (
    <div>
      <h1>フレンドリクエスト</h1>
      <ul>
        {requests.map((request) => {
          const isBlocked = blockedUsers.includes(request.sender_id); // リクエストの送信者がブロックされているか確認
          return (
            <li key={request.id}>
              {request.sender_name}
              <button
                onClick={() => handleAccept(request.id)}
                className={isBlocked ? "disabled-button" : ""}
                disabled={isBlocked} // ブロックされている場合はボタンを無効化
              >
                承認
              </button>
              <button
                onClick={() => handleReject(request.id)}
                className={isBlocked ? "disabled-button" : ""}
                disabled={isBlocked} // ブロックされている場合はボタンを無効化
              >
                拒否
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FriendRequestList;

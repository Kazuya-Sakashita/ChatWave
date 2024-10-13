import { useCallback, useEffect, useState } from "react";
import { createConsumer } from "@rails/actioncable";
import {
  Friend,
  FriendRequest,
  FriendsResponse,
} from "../types/componentTypes";

const useFriendApi = () => {
  const [friends, setFriends] = useState<FriendsResponse | null>(null);

  // フレンド一覧を取得する処理
  const getFriends = useCallback(async (): Promise<FriendsResponse> => {
    try {
      const response = await fetch(`http://localhost:3000/friends`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("フレンド一覧取得エラー:", errorData);
        throw new Error("フレンド一覧の取得に失敗しました。");
      }

      const data: FriendsResponse = await response.json();
      setFriends(data); // フレンドリストを更新
      console.log("フレンド一覧取得成功:", data);
      return data;
    } catch (error) {
      console.error("エラーが発生しました:", error);
      throw error;
    }
  }, []);

  // フレンド申請の処理
  const sendFriendRequest = useCallback(
    async (friendId: number) => {
      try {
        const response = await fetch(`http://localhost:3000/friends`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ friend_id: friendId }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("フレンド申請エラー:", errorData);
          throw new Error("フレンド申請に失敗しました。");
        }

        const data = await response.json();
        console.log("フレンド申請成功:", data);
        await getFriends(); // フレンドリストを更新
        return data;
      } catch (error) {
        console.error("エラーが発生しました:", error);
        throw error;
      }
    },
    [getFriends]
  );

  // フレンド申請の承認・拒否・キャンセル処理
  const respondToFriendRequest = useCallback(
    async (id: number, actionType: "accept" | "reject" | "cancel") => {
      try {
        const response = await fetch(`http://localhost:3000/friends/${id}`, {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action_type: actionType }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("フレンドリクエスト応答エラー:", errorData);
          throw new Error("フレンドリクエストの応答に失敗しました。");
        }

        const data = await response.json();
        console.log("フレンドリクエスト応答成功:", data);
        await getFriends(); // フレンドリストを更新
        return data;
      } catch (error) {
        console.error("エラーが発生しました:", error);
        throw error;
      }
    },
    [getFriends]
  );

  // ブロック処理
  const blockFriend = useCallback(
    async (friendId: number) => {
      try {
        const response = await fetch(
          `http://localhost:3000/friends/${friendId}/block`,
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("ブロックエラー:", errorData);
          throw new Error("フレンドのブロックに失敗しました。");
        }

        const data = await response.json();
        console.log("ブロック成功:", data);
        await getFriends(); // リストを更新
        return data;
      } catch (error) {
        console.error("エラーが発生しました:", error);
        throw error;
      }
    },
    [getFriends]
  );

  // ブロック解除処理
  const unblockFriend = useCallback(
    async (friendId: number) => {
      try {
        const response = await fetch(
          `http://localhost:3000/friends/${friendId}/unblock`,
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("ブロック解除エラー:", errorData);
          throw new Error("ブロック解除に失敗しました。");
        }

        const data = await response.json();
        console.log("ブロック解除成功:", data);
        await getFriends(); // リストを更新
        return data;
      } catch (error) {
        console.error("エラーが発生しました:", error);
        throw error;
      }
    },
    [getFriends]
  );

  // ブロックされたフレンドのリストを取得する処理
  const getBlockedFriends = useCallback(async (): Promise<Friend[]> => {
    try {
      const response = await fetch(
        `http://localhost:3000/friends/blocked_friends`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("ブロックされたフレンドの取得エラー:", errorData);
        throw new Error("ブロックされたフレンドの取得に失敗しました。");
      }

      const data: Friend[] = await response.json();
      console.log("ブロックされたフレンド取得成功:", data);
      return data;
    } catch (error) {
      console.error("エラーが発生しました:", error);
      throw error;
    }
  }, []);

  // 承認待ちのフレンドリクエストを取得する処理
  const getPendingFriendRequests = useCallback(async (): Promise<
    FriendRequest[]
  > => {
    try {
      const response = await fetch(
        `http://localhost:3000/friends/pending_requests`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("承認待ちのフレンドリクエストの取得に失敗しました。");
      }

      const data: FriendRequest[] = await response.json();
      console.log("承認待ちフレンドリクエスト取得成功:", data);
      return data;
    } catch (error) {
      console.error("エラーが発生しました:", error);
      throw error;
    }
  }, []);

  // ActionCableでサーバーからのフレンド更新を受信
  useEffect(() => {
    const cable = createConsumer("ws://localhost:3000/cable");

    const subscription = cable.subscriptions.create(
      { channel: "FriendUpdatesChannel" },
      {
        received: (data) => {
          console.log("フレンド情報が更新されました:", data);
          if (
            data.message === "friend_updated" ||
            data.message === "block_status_changed"
          ) {
            getFriends(); // フレンドリストを更新
          }
        },
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [getFriends]);

  return {
    friends,
    sendFriendRequest,
    respondToFriendRequest,
    cancelFriendRequest: respondToFriendRequest, // キャンセルも同じ処理を再利用
    blockFriend,
    unblockFriend,
    getFriends,
    getBlockedFriends,
    getPendingFriendRequests,
  };
};

export default useFriendApi;

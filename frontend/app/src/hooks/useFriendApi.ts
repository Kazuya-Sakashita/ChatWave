import { useCallback } from "react";
import {
  Friend,
  FriendRequest,
  FriendsResponse,
} from "../types/componentTypes";

const useFriendApi = () => {
  // フレンド申請の処理
  const sendFriendRequest = useCallback(async (friendId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/friends`, // フレンド申請のエンドポイント
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ friend_id: friendId }), // ボディに friend_id を含める
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("フレンド申請エラー:", errorData);
        throw new Error("フレンド申請に失敗しました。");
      }

      const data = await response.json();
      console.log("フレンド申請成功:", data);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("エラーが発生しました:", error.message);
      } else {
        console.error("予期しないエラーが発生しました:", error);
      }
      throw error;
    }
  }, []);

  // フレンド申請の承認や拒否、キャンセルの処理
  const respondToFriendRequest = useCallback(
    async (id: number, actionType: "accept" | "reject" | "cancel") => {
      try {
        // actionType をコンソールに表示
        console.log("Action Type:", actionType);

        const response = await fetch(
          `http://localhost:3000/friends/${id}`, // フレンド承認・拒否のエンドポイント修正
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ action_type: actionType }), // action_type を含める
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("フレンドリクエスト応答エラー:", errorData);
          throw new Error("フレンドリクエストの応答に失敗しました。");
        }

        const data = await response.json();
        console.log("フレンドリクエスト応答成功:", data);
        return data;
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("エラーが発生しました:", error.message);
        } else {
          console.error("予期しないエラーが発生しました:", error);
        }
        throw error;
      }
    },
    []
  );

  // フレンド申請のキャンセル処理
  const cancelFriendRequest = useCallback(async (friendId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/friends/${friendId}/cancel`, // キャンセル用のエンドポイント
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("フレンド申請キャンセルエラー:", errorData);
        throw new Error("フレンド申請のキャンセルに失敗しました。");
      }

      const data = await response.json();
      console.log("フレンド申請キャンセル成功:", data);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("エラーが発生しました:", error.message);
      } else {
        console.error("予期しないエラーが発生しました:", error);
      }
      throw error;
    }
  }, []);

  // フレンドをブロックする処理
  const blockFriend = useCallback(async (friendId: number) => {
    try {
      const response = await fetch(
        `http://localhost:3000/friends/${friendId}/block`, // ブロック用エンドポイント
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
        console.error("フレンドブロックエラー:", errorData);
        throw new Error("フレンドのブロックに失敗しました。");
      }

      const data = await response.json();
      console.log("フレンドブロック成功:", data);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("エラーが発生しました:", error.message);
      } else {
        console.error("予期しないエラーが発生しました:", error);
      }
      throw error;
    }
  }, []);

  // ブロック解除処理
  const unblockFriend = useCallback(async (friendId: number) => {
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
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("エラーが発生しました:", error.message);
      } else {
        console.error("予期しないエラーが発生しました:", error);
      }
      throw error;
    }
  }, []);

  // フレンドリクエスト一覧の取得処理
  const getFriendRequests = useCallback(async (): Promise<FriendRequest[]> => {
    try {
      const response = await fetch(`http://localhost:3000/friend_requests`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("フレンドリクエスト取得エラー:", errorData);
        throw new Error("フレンドリクエストの取得に失敗しました。");
      }

      const data: FriendRequest[] = await response.json();
      console.log("フレンドリクエスト取得成功:", data);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("エラーが発生しました:", error.message);
      } else {
        console.error("予期しないエラーが発生しました:", error);
      }
      throw error;
    }
  }, []);

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
      console.log("フレンド一覧取得成功:", data);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("エラーが発生しました:", error.message);
      } else {
        console.error("予期しないエラーが発生しました:", error);
      }
      throw error;
    }
  }, []);

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
      console.log("ブロックされたフレンドの取得成功:", data);
      return data;
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("エラーが発生しました:", error.message);
      } else {
        console.error("予期しないエラーが発生しました:", error);
      }
      throw error;
    }
  }, []);

  // 新しく追加：承認待ちのフレンドリクエストを取得する関数
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

      return await response.json();
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    sendFriendRequest,
    respondToFriendRequest,
    cancelFriendRequest, // フレンド申請キャンセルの処理を追加
    blockFriend,
    unblockFriend,
    getFriendRequests,
    getFriends,
    getBlockedFriends,
    getPendingFriendRequests,
  };
};

export default useFriendApi;

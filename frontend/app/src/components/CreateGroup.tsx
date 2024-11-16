import React, { useEffect, useState } from "react";
import { Friend, Group } from "../types/componentTypes";
import "./CreateGroup.css";

const CreateGroup: React.FC = () => {
  const [groupName, setGroupName] = useState<string>("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // API ベース URL を環境変数から取得
  const apiBaseUrl =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

  useEffect(() => {
    // フレンド一覧の取得
    const fetchFriends = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/friends`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setFriends(data.confirmed_friends || []);
      } catch (error) {
        console.error("フレンド一覧の取得に失敗しました:", error);
      }
    };

    fetchFriends();
  }, [apiBaseUrl]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim() === "" || selectedMembers.length === 0) {
      setError("グループ名とメンバーを選択してください。");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/groups`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group: { name: groupName, member_ids: selectedMembers },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("グループ作成エラー:", errorData.errors);
        setError("グループ作成に失敗しました。");
        setLoading(false);
        return;
      }

      alert("グループが正常に作成されました！");
      setGroupName("");
      setSelectedMembers([]);
    } catch (error) {
      console.error("グループ作成に失敗しました:", error);
      setError("グループ作成に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  // メンバー選択のハンドラー
  const handleMemberSelect = (friendId: number) => {
    setSelectedMembers((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  return (
    <div className="create-group-container">
      <h2>グループを作成</h2>
      <form onSubmit={handleCreateGroup} className="create-group-form">
        <input
          type="text"
          placeholder="グループ名を入力"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="group-input"
        />
        <div className="members-selection">
          <h3>メンバーを選択</h3>
          <div className="friends-list">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className={`friend-card ${
                  selectedMembers.includes(friend.id) ? "selected" : ""
                }`}
                onClick={() => handleMemberSelect(friend.id)}
              >
                <img
                  src={
                    friend.avatar_url?.startsWith("/uploads")
                      ? `${apiBaseUrl}${friend.avatar_url}`
                      : `${apiBaseUrl}/uploads/profile/avatar/1/default_avatar.jpeg`
                  }
                  alt={friend.name}
                  className="friend-avatar"
                />
                <p className="friend-name">{friend.name}</p>
              </div>
            ))}
          </div>
        </div>
        <button
          type="submit"
          className="group-submit-button"
          disabled={loading}
        >
          {loading ? "作成中..." : "グループ作成"}
        </button>
      </form>
      {error && <p className="group-error">{error}</p>}
    </div>
  );
};

export default CreateGroup;

import React, { useEffect, useState } from "react";
import { Friend, Group } from "../types/componentTypes";
import "./CreateGroup.css"; // 必要ならCSSファイルを作成

const CreateGroup: React.FC = () => {
  const [groupName, setGroupName] = useState<string>("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // フレンド一覧の取得
    const fetchFriends = async () => {
      try {
        const response = await fetch("http://localhost:3000/friends", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setFriends(data.confirmed_friends); // フレンド一覧をセット
      } catch (error) {
        console.error("フレンド一覧の取得に失敗しました:", error);
      }
    };

    fetchFriends();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim() === "" || selectedMembers.length === 0) {
      setError("グループ名とメンバーを選択してください。");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:3000/groups", {
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

      const data: Group = await response.json();
      console.log("グループ作成成功:", data);
      setGroupName("");
      setSelectedMembers([]); // フォームをクリア
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
          <ul className="friends-list">
            {friends.map((friend) => (
              <li key={friend.id}>
                <label>
                  <input
                    type="checkbox"
                    value={friend.id}
                    onChange={() => handleMemberSelect(friend.id)}
                    checked={selectedMembers.includes(friend.id)}
                  />
                  {friend.name}
                </label>
              </li>
            ))}
          </ul>
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

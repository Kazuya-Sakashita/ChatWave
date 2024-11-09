import React, { useEffect, useState } from "react";
import { Group, User } from "../types/componentTypes";
import "./GroupList.css";

// レスポンス型の定義
interface SelectableMembersResponse {
  members: User[];
}

const GroupList: React.FC = () => {
  const [groups, setGroups] = useState<Group[] | undefined>(undefined);
  const [selectableMembers, setSelectableMembers] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [newGroupName, setNewGroupName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // グループ一覧と選択可能なメンバー一覧の取得
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch("http://localhost:3000/groups", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error("グループ一覧の取得に失敗しました");

        const data = await response.json();
        setGroups(data.groups || []);
      } catch (error) {
        console.error(error);
        setError("グループ一覧の取得に失敗しました");
      }
    };

    const fetchSelectableMembers = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/groups/selectable_members",
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) throw new Error("メンバー一覧の取得に失敗しました");

        const data: SelectableMembersResponse = await response.json();
        console.log("取得したデータ:", data);

        // データ構造に応じて設定
        if (Array.isArray(data.members)) {
          setSelectableMembers(data.members);
        } else {
          console.warn("予期しないデータ構造:", data);
          setSelectableMembers([]);
        }
      } catch (error) {
        console.error(error);
        setError("メンバー一覧の取得に失敗しました");
      }
    };

    fetchGroups();
    fetchSelectableMembers();
  }, []);

  // グループ作成関数
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim() === "") {
      setError("グループ名を入力してください。");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const memberIds = selectedMembers.length > 0 ? selectedMembers : [];
      const response = await fetch("http://localhost:3000/groups", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          group: { name: newGroupName },
          member_ids: memberIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(
          "グループ作成に失敗しました。エラーメッセージを確認してください。"
        );
        setLoading(false);
        return;
      }

      const data = await response.json();
      setGroups((prevGroups) => [...(prevGroups || []), data]);
      setNewGroupName("");
      setSelectedMembers([]);
    } catch (error) {
      console.error("グループ作成に失敗しました:", error);
      setError("グループ作成に失敗しました。サーバーに接続できませんでした。");
    } finally {
      setLoading(false);
    }
  };

  // メンバー選択のハンドラ
  const handleMemberSelection = (userId: number) => {
    setSelectedMembers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  return (
    <div className="group-list-container">
      <h2>あなたが参加しているグループ一覧</h2>
      <ul className="group-list">
        {groups?.length ? (
          groups.map((group) => (
            <li key={group.id} className="group-list-item">
              <a href={`/groups/${group.id}`} className="group-link">
                {group.name}
              </a>
            </li>
          ))
        ) : (
          <p>参加しているグループがありません。</p>
        )}
      </ul>

      <h3>新しいグループを作成</h3>
      <form onSubmit={handleCreateGroup} className="create-group-form">
        <input
          type="text"
          placeholder="グループ名を入力"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          className="group-input"
        />

        <h4>メンバーを選択</h4>
        <ul className="user-list">
          {selectableMembers.length > 0 ? (
            selectableMembers.map((user) => (
              <li key={user.id} className="user-list-item">
                <label>
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(user.id)}
                    onChange={() => handleMemberSelection(user.id)}
                  />
                  {user.name}
                </label>
              </li>
            ))
          ) : (
            <p>選択可能なメンバーが見つかりません。</p>
          )}
        </ul>

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

export default GroupList;

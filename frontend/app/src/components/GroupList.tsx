import React, { useEffect, useState } from "react";
import { Group } from "../types/componentTypes";
import "./GroupList.css"; // CSSファイルをインポート

const GroupList: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState<string>(""); // 新しいグループ名を管理するためのステート
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        console.log("グループ一覧を取得開始...");
        const response = await fetch("http://localhost:3000/groups", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          console.error("グループ一覧の取得に失敗しました:", response.status);
          return;
        }

        const data = await response.json();
        console.log("取得したグループデータ:", data.groups);
        setGroups(data.groups);
      } catch (error) {
        console.error("グループ一覧のフェッチに失敗しました:", error);
      }
    };

    fetchGroups();
  }, []);

  // 新しいグループを作成する関数
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim() === "") {
      setError("グループ名を入力してください。");
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
        body: JSON.stringify({ group: { name: newGroupName } }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("グループ作成エラー:", errorData.errors);
        setError("グループ作成に失敗しました。");
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log("グループ作成成功:", data);
      setGroups((prevGroups) => [...prevGroups, data]);
      setNewGroupName(""); // フォームをクリア
    } catch (error) {
      console.error("グループ作成に失敗しました:", error);
      setError("グループ作成に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group-list-container">
      <h2>あなたが参加しているグループ一覧</h2>
      <ul className="group-list">
        {groups.map((group) => (
          <li key={group.id} className="group-list-item">
            <a href={`/groups/${group.id}`} className="group-link">
              {group.name}
            </a>
            <span className="group-action">チャットに参加</span>
          </li>
        ))}
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

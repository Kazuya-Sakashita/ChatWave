import React, { useEffect, useState } from "react";
import { Group, User } from "../types/componentTypes";
import MemberSelection from "../components/MemberSelection";
import "./GroupList.css";

interface SelectableMembersResponse {
  members: User[];
}

const GroupList: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectableMembers, setSelectableMembers] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [newGroupName, setNewGroupName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSelection, setResetSelection] = useState<boolean>(false);

  // Fetch groups and selectable members
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch("http://localhost:3000/groups", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch group list.");
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
        if (!response.ok) throw new Error("Failed to fetch member list.");
        const data: SelectableMembersResponse = await response.json();
        setSelectableMembers(data.members || []);
      } catch (error) {
        console.error(error);
        setError("メンバー一覧の取得に失敗しました");
      }
    };

    fetchGroups();
    fetchSelectableMembers();
  }, []);

  // Handle group creation
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim() === "") {
      setError("グループ名を入力してください。");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const memberIds = selectedMembers.map((user) => user.id);
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
        setError("グループ作成に失敗しました。");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setGroups((prevGroups) => [...prevGroups, data]);
      setNewGroupName("");
      setSelectedMembers([]);
      setResetSelection((prev) => !prev);
      alert("グループが正常に作成されました！");
    } catch (error) {
      console.error("Failed to create group:", error);
      setError("グループ作成に失敗しました。サーバーに接続できませんでした。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group-management-container">
      {/* Group List Section */}
      <div className="group-list-section">
        <h2>グループ一覧</h2>
        <ul className="group-list">
          {groups.length > 0 ? (
            groups.map((group) => (
              <li key={group.id} className="group-card">
                <a href={`/groups/${group.id}`} className="group-link">
                  {group.name}
                </a>
              </li>
            ))
          ) : (
            <p className="no-groups">参加しているグループがありません。</p>
          )}
        </ul>
      </div>

      {/* Create Group Section */}
      <div className="create-group-section">
        <h2>新しいグループを作成</h2>
        <form onSubmit={handleCreateGroup} className="create-group-form">
          <input
            type="text"
            placeholder="グループ名を入力"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            className="group-input"
          />
          <h4>メンバーを選択</h4>
          <MemberSelection
            users={selectableMembers}
            selectedMembers={selectedMembers}
            onSelectionChange={setSelectedMembers}
            resetSelection={resetSelection}
          />
          <button
            type="submit"
            className="group-submit-button"
            disabled={
              loading ||
              newGroupName.trim().length === 0 ||
              selectedMembers.length === 0
            }
          >
            {loading ? "作成中..." : "グループ作成"}
          </button>
        </form>

        {error && <p className="group-error">{error}</p>}
      </div>
    </div>
  );
};

export default GroupList;

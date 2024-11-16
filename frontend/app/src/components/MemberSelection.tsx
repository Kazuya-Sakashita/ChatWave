import React, { useEffect, useState } from "react";
import { User } from "../types/componentTypes";
import "../components/MemberSelection.css";

interface MemberSelectionProps {
  users: User[];
  onSelectionChange: (selectedUsers: User[]) => void;
  resetSelection: boolean; // リセットフラグの追加
}

const MemberSelection: React.FC<MemberSelectionProps> = ({
  users,
  onSelectionChange,
  resetSelection,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // ベース URL を環境変数から取得
  const apiBaseUrl =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

  // ユーザーを選択する関数
  const handleSelectUser = (user: User) => {
    const isSelected = selectedUsers.some((u) => u.id === user.id);
    if (isSelected) {
      const updatedSelection = selectedUsers.filter((u) => u.id !== user.id);
      setSelectedUsers(updatedSelection);
      onSelectionChange(updatedSelection);
    } else {
      const updatedSelection = [...selectedUsers, user];
      setSelectedUsers(updatedSelection);
      onSelectionChange(updatedSelection);
    }
  };

  // リセットフラグが変更された場合に選択をクリア
  useEffect(() => {
    if (resetSelection) {
      setSelectedUsers([]);
      onSelectionChange([]);
    }
  }, [resetSelection, onSelectionChange]);

  // 検索フィルタリング
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="member-selection-container">
      <input
        type="text"
        placeholder="ユーザー検索"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <div className="user-list-horizontal">
        {filteredUsers.map((user) => (
          <div
            key={user.id}
            className={`user-card ${
              selectedUsers.some((u) => u.id === user.id) ? "selected" : ""
            }`}
            onClick={() => handleSelectUser(user)}
          >
            <img
              src={
                user.avatar_url?.startsWith("/uploads")
                  ? `${apiBaseUrl}${user.avatar_url}`
                  : `${apiBaseUrl}/uploads/profile/avatar/1/default_avatar.jpeg`
              }
              alt={user.name}
              className="user-avatar"
            />
            <p className="user-name">{user.name}</p>
          </div>
        ))}
      </div>
      <div className="selected-users">
        <h3>選択されたメンバー:</h3>
        {selectedUsers.map((user) => (
          <span key={user.id} className="selected-user-tag">
            {user.name}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MemberSelection;

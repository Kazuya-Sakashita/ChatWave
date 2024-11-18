import React, { useEffect, useState } from "react";
import { User } from "../types/componentTypes";
import "../components/MemberSelection.css";

interface MemberSelectionProps {
  users: User[];
  selectedMembers: User[];
  onSelectionChange: (selectedUsers: User[]) => void;
  resetSelection: boolean;
}

const MemberSelection: React.FC<MemberSelectionProps> = ({
  users,
  selectedMembers,
  onSelectionChange,
  resetSelection,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<User[]>(selectedMembers);

  // リセットフラグが変更された場合に選択をクリア
  useEffect(() => {
    if (resetSelection) {
      setSelectedUsers([]);
      onSelectionChange([]);
    }
  }, [resetSelection, onSelectionChange]);

  // 親コンポーネントからの `selectedMembers` の変更を反映
  useEffect(() => {
    console.log("selectedMembers:", selectedMembers);
    setSelectedUsers(selectedMembers);
  }, [selectedMembers]);

  // `users` データのログ出力
  useEffect(() => {
    console.log("Fetched users data:", users);
    users.forEach((user) => {
      console.log("User ID:", user.id);
      console.log("User Name:", user.name);
      console.log("User Avatar URL:", user.avatar_url);
    });
  }, [users]);

  // アバター画像の URL を取得する関数
  const getAvatarUrl = (avatarUrl?: string) => {
    const baseUrl =
      process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";
    console.log("Received avatarUrl:", avatarUrl);

    // avatarUrl が存在し、空文字列でもなく、デフォルト画像でもない場合
    if (
      avatarUrl &&
      avatarUrl !== "" &&
      avatarUrl !== "/uploads/profile/avatar/1/default_avatar.jpeg"
    ) {
      if (avatarUrl.startsWith("http")) {
        console.log("Using external URL:", avatarUrl);
        return avatarUrl;
      }
      console.log("Using local URL:", `${baseUrl}${avatarUrl}`);
      return `${baseUrl}${avatarUrl}`;
    }

    // デフォルトの画像を返す
    console.log("Using default avatar URL.");
    return `${baseUrl}/uploads/profile/avatar/1/default_avatar.jpeg`;
  };

  const handleSelectUser = (user: User) => {
    const isSelected = selectedUsers.some((u) => u.id === user.id);
    const updatedSelection = isSelected
      ? selectedUsers.filter((u) => u.id !== user.id)
      : [...selectedUsers, user];

    setSelectedUsers(updatedSelection);
    onSelectionChange(updatedSelection);
  };

  return (
    <div className="member-selection-container">
      <div className="user-list-horizontal">
        {users.map((user) => (
          <div
            key={user.id}
            className={`user-card ${
              selectedUsers.some((u) => u.id === user.id) ? "selected" : ""
            }`}
            onClick={() => handleSelectUser(user)}
          >
            <img
              src={getAvatarUrl(user.avatar_url)}
              alt={user.name}
              className="user-avatar"
            />
            <p className="user-name">{user.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberSelection;

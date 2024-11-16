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
    setSelectedUsers(selectedMembers);
  }, [selectedMembers]);

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
              src={
                user.avatar_url?.startsWith("/uploads")
                  ? `${process.env.REACT_APP_API_BASE_URL}${user.avatar_url}`
                  : `${process.env.REACT_APP_API_BASE_URL}/uploads/profile/avatar/1/default_avatar.jpeg`
              }
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

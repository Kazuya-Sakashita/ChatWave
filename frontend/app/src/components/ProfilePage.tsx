import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axiosConfig";
import styles from "./ProfilePage.module.css"; // CSSファイルをインポート
import { Profile } from "../types/componentTypes"; // 型をインポート

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/profile");
        setProfile(response.data.profile);
      } catch (err) {
        setError("プロフィール情報の取得に失敗しました");
      }
    };

    fetchProfile();
  }, []);

  // 性別を日本語に変換する関数
  const translateGender = (gender: string) => {
    switch (gender) {
      case "male":
        return "男";
      case "female":
        return "女";
      case "other":
        return "その他";
      default:
        return gender; // 予期しない値が来た場合はそのまま表示
    }
  };

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div className={styles["profile-container"]}>
      <h1>プロフィール</h1>
      {profile && (
        <div className={styles["profile-content"]}>
          <p>フルネーム: {profile.full_name}</p>
          <p>生年月日: {profile.birth_date}</p>
          <p>性別: {translateGender(profile.gender)}</p>{" "}
          {/* 性別を日本語で表示 */}
          <p>電話番号: {profile.phone_number}</p>
          <p>郵便番号: {profile.postal_code}</p>
          <p>住所: {profile.address}</p>
          {profile.avatar_url && (
            <div className={styles["avatar-container"]}>
              <img
                src={profile.avatar_url}
                alt="プロフィール画像"
                className={styles["avatar"]}
              />
            </div>
          )}
          <Link to="/profile/edit" className={styles["edit-button"]}>
            編集
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

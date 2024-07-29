import React, { useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import styles from "./ProfilePage.module.css"; // CSSファイルをインポート

interface Profile {
  full_name: string;
  birth_date: string;
  gender: string;
  phone_number: string;
  postal_code: string;
  address: string;
  avatar_url: string;
}

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
          <p>性別: {profile.gender}</p>
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
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

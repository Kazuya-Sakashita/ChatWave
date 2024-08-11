import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../api/axiosConfig";
import styles from "./ProfilePage.module.css"; // CSSファイルをインポート
import { Profile } from "../types/componentTypes"; // 型をインポート

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notificationEnabled, setNotificationEnabled] = useState(true); // 初期状態をtrueに設定している可能性がある

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

  useEffect(() => {
    const fetchNotificationSetting = async () => {
      try {
        const response = await axios.get("/notification_setting");
        setNotificationEnabled(response.data.enabled); // バックエンドから取得した状態を反映
      } catch (err) {
        console.error("通知設定の取得に失敗しました");
      }
    };

    fetchNotificationSetting();
  }, []);

  const handleToggleChange = async () => {
    try {
      // トグルの状態を反転してバックエンドに送信
      const response = await axios.put("/notification_setting", {
        enabled: !notificationEnabled,
      });

      // バックエンドからのレスポンスに基づいてstateを更新
      setNotificationEnabled(response.data.enabled);
    } catch (err) {
      console.error("通知設定の更新に失敗しました");
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
          <div className={styles["notification-toggle"]}>
            <span className={styles["toggle-label"]}>通知設定:</span>
            <div className={styles["toggle-wrapper"]}>
              <span className={styles["toggle-text"]}>オフ</span>
              <label className={styles["switch"]}>
                <input
                  type="checkbox"
                  checked={notificationEnabled} // ここでバックエンドから取得した状態が反映されます
                  onChange={handleToggleChange}
                />
                <span className={styles["slider"]}></span>
              </label>
              <span className={styles["toggle-text"]}>オン</span>
            </div>
          </div>
          <Link to="/profile/edit" className={styles["edit-button"]}>
            編集
          </Link>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

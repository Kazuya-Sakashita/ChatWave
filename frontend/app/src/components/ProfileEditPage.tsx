import React, { useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import styles from "./ProfileEditPage.module.css"; // CSSファイルをインポート
import { ProfilePageState } from "../types/componentTypes"; // 型をインポート

const ProfileEditPage: React.FC = () => {
  const [profile, setProfile] = useState<ProfilePageState>({
    fullName: "",
    birthDate: "",
    gender: "",
    phoneNumber: "",
    postalCode: "",
    address: "",
    avatar: null,
    visibility: "public",
    error: null,
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/profile");
        const {
          full_name,
          birth_date,
          gender,
          phone_number,
          postal_code,
          address,
          avatar_url,
        } = response.data.profile;
        setProfile((prevProfile) => ({
          ...prevProfile,
          fullName: full_name,
          birthDate: birth_date,
          gender: gender,
          phoneNumber: phone_number,
          postalCode: postal_code,
          address: address,
        }));
        setAvatarUrl(avatar_url);
      } catch (err) {
        setProfile((prevProfile) => ({
          ...prevProfile,
          error: "プロフィール情報の取得に失敗しました",
        }));
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setProfile((prevProfile) => ({
        ...prevProfile,
        avatar: files[0],
      }));
      setAvatarUrl(URL.createObjectURL(files[0])); // 選択した新しい画像をプレビュー
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("profile[full_name]", profile.fullName);
    formData.append("profile[birth_date]", profile.birthDate);
    formData.append("profile[gender]", profile.gender);
    formData.append("profile[phone_number]", profile.phoneNumber);
    formData.append("profile[postal_code]", profile.postalCode);
    formData.append("profile[address]", profile.address);
    if (profile.avatar) {
      formData.append("profile[avatar]", profile.avatar);
    }

    try {
      await axios.put("/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/profile");
    } catch (err) {
      setProfile((prevProfile) => ({
        ...prevProfile,
        error: "プロフィールの更新に失敗しました",
      }));
    }
  };

  return (
    <div className={styles["profile-edit-container"]}>
      <h1>プロフィール編集</h1>
      {profile.error && <p style={{ color: "red" }}>{profile.error}</p>}
      <form onSubmit={handleSubmit} className={styles["profile-edit-form"]}>
        <div>
          <label>フルネーム:</label>
          <input
            type="text"
            name="fullName"
            value={profile.fullName}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>生年月日:</label>
          <input
            type="date"
            name="birthDate"
            value={profile.birthDate}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>性別:</label>
          <input
            type="text"
            name="gender"
            value={profile.gender}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>電話番号:</label>
          <input
            type="text"
            name="phoneNumber"
            value={profile.phoneNumber}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>郵便番号:</label>
          <input
            type="text"
            name="postalCode"
            value={profile.postalCode}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>住所:</label>
          <input
            type="text"
            name="address"
            value={profile.address}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>プロフィール画像:</label>
          {avatarUrl && (
            <div className={styles["avatar-preview"]}>
              <img
                src={avatarUrl}
                alt="現在のプロフィール画像"
                className={styles["avatar"]}
              />
            </div>
          )}
          <input type="file" name="avatar" onChange={handleFileChange} />
        </div>
        <button type="submit">更新</button>
      </form>
    </div>
  );
};

export default ProfileEditPage;

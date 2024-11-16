import React, { useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import styles from "./ProfileEditPage.module.css"; // CSSファイルをインポート
import { ProfilePageState } from "../types/componentTypes"; // 型をインポート

const ProfileEditPage: React.FC = () => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfilePageState>();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

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

        setValue("fullName", full_name);
        setValue("birthDate", birth_date);
        setValue("gender", gender);
        setValue("phoneNumber", phone_number);
        setValue("postalCode", postal_code);
        setValue("address", address);
        setAvatarUrl(avatar_url);
      } catch (err) {
        setProfileError("プロフィール情報の取得に失敗しました");
      }
    };

    fetchProfile();
  }, [setValue]);

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      setValue("avatar", files[0]);
      setAvatarUrl(URL.createObjectURL(files[0])); // 選択した新しい画像をプレビュー
    }
  };

  const onSubmit = async (data: ProfilePageState) => {
    const formData = new FormData();
    formData.append("profile[full_name]", data.fullName);
    formData.append("profile[birth_date]", data.birthDate);
    formData.append("profile[gender]", data.gender);
    formData.append("profile[phone_number]", data.phoneNumber);
    formData.append("profile[postal_code]", data.postalCode);
    formData.append("profile[address]", data.address);
    if (data.avatar) {
      formData.append("profile[avatar]", data.avatar);
    }

    try {
      await axios.put("/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/profile");
    } catch (err) {
      setProfileError("プロフィールの更新に失敗しました");
    }
  };

  return (
    <div className={styles["profile-edit-container"]}>
      <h1>プロフィール編集</h1>
      {profileError && <p style={{ color: "red" }}>{profileError}</p>}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={styles["profile-edit-form"]}
      >
        <div>
          <label>フルネーム:</label>
          <Controller
            name="fullName"
            control={control}
            defaultValue=""
            rules={{ required: "フルネームは必須です" }}
            render={({ field }) => <input type="text" {...field} />}
          />
          {errors.fullName && (
            <p style={{ color: "red" }}>{errors.fullName.message}</p>
          )}
        </div>
        <div>
          <label>生年月日:</label>
          <Controller
            name="birthDate"
            control={control}
            defaultValue=""
            rules={{ required: "生年月日は必須です" }}
            render={({ field }) => <input type="date" {...field} />}
          />
          {errors.birthDate && (
            <p style={{ color: "red" }}>{errors.birthDate.message}</p>
          )}
        </div>
        <div>
          <Controller
            name="gender"
            control={control}
            defaultValue=""
            rules={{ required: "性別は必須です" }}
            render={({ field }) => (
              <div>
                <label>性別:</label>
                <div className={styles["gender-options"]}>
                  <label>
                    <input
                      type="radio"
                      value="male"
                      onChange={() => field.onChange("male")}
                      checked={field.value === "male"}
                    />
                    男
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="female"
                      onChange={() => field.onChange("female")}
                      checked={field.value === "female"}
                    />
                    女
                  </label>
                  <label>
                    <input
                      type="radio"
                      value="other"
                      onChange={() => field.onChange("other")}
                      checked={field.value === "other"}
                    />
                    その他
                  </label>
                </div>
                {errors.gender && (
                  <p style={{ color: "red" }}>{errors.gender.message}</p>
                )}
              </div>
            )}
          />

          {errors.gender && (
            <p style={{ color: "red" }}>{errors.gender.message}</p>
          )}
        </div>
        <div>
          <label>電話番号:</label>
          <Controller
            name="phoneNumber"
            control={control}
            defaultValue=""
            rules={{ required: "電話番号は必須です" }}
            render={({ field }) => <input type="text" {...field} />}
          />
          {errors.phoneNumber && (
            <p style={{ color: "red" }}>{errors.phoneNumber.message}</p>
          )}
        </div>
        <div>
          <label>郵便番号:</label>
          <Controller
            name="postalCode"
            control={control}
            defaultValue=""
            rules={{ required: "郵便番号は必須です" }}
            render={({ field }) => <input type="text" {...field} />}
          />
          {errors.postalCode && (
            <p style={{ color: "red" }}>{errors.postalCode.message}</p>
          )}
        </div>
        <div>
          <label>住所:</label>
          <Controller
            name="address"
            control={control}
            defaultValue=""
            rules={{ required: "住所は必須です" }}
            render={({ field }) => <input type="text" {...field} />}
          />
          {errors.address && (
            <p style={{ color: "red" }}>{errors.address.message}</p>
          )}
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
          <Controller
            name="avatar"
            control={control}
            defaultValue={null}
            render={({ field }) => (
              <input
                type="file"
                onChange={(e) => {
                  field.onChange(e.target.files?.[0]);
                  handleFileChange(e.target.files);
                }}
              />
            )}
          />
          {errors.avatar && (
            <p style={{ color: "red" }}>{errors.avatar.message}</p>
          )}
        </div>
        <button type="submit">更新</button>
      </form>
    </div>
  );
};

export default ProfileEditPage;

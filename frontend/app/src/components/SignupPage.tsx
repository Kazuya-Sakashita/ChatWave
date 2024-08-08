import React, { useState } from "react";
import axios from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import styles from "./SignupPage.module.css";
import { SignupPageState } from "../types/componentTypes";

const SignupPage: React.FC = () => {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupPageState>();
  const [serverError, setServerError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (data: SignupPageState) => {
    if (data.password !== data.passwordConfirmation) {
      setError("passwordConfirmation", {
        type: "manual",
        message: "パスワードが一致しません",
      });
      return;
    }

    const formData = new FormData();
    formData.append("user[name]", data.name);
    formData.append("user[email]", data.email);
    formData.append("user[password]", data.password);
    formData.append("user[password_confirmation]", data.passwordConfirmation);
    formData.append("user[profile_attributes][full_name]", data.fullName);
    formData.append("user[profile_attributes][birth_date]", data.birthDate);
    formData.append("user[profile_attributes][gender]", data.gender);
    formData.append("user[profile_attributes][phone_number]", data.phoneNumber);
    formData.append("user[profile_attributes][postal_code]", data.postalCode);
    formData.append("user[profile_attributes][address]", data.address);
    if (data.avatar) {
      formData.append("user[profile_attributes][avatar]", data.avatar);
    }

    try {
      await axios.post("/signup", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/confirmation");
    } catch (err) {
      setServerError("登録に失敗しました");
    }
  };

  const handleAvatarChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className={styles["form-container"]}>
      <h1>サインアップ</h1>
      {serverError && <p style={{ color: "red" }}>{serverError}</p>}
      <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
        <Controller
          name="name"
          control={control}
          defaultValue=""
          rules={{ required: "名前は必須です" }}
          render={({ field }) => (
            <div>
              <label>名前:</label>
              <input type="text" {...field} />
              {errors.name && (
                <p style={{ color: "red" }}>{errors.name.message}</p>
              )}
            </div>
          )}
        />
        <Controller
          name="email"
          control={control}
          defaultValue=""
          rules={{
            required: "メールアドレスは必須です",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "有効なメールアドレスを入力してください",
            },
          }}
          render={({ field }) => (
            <div>
              <label>メールアドレス:</label>
              <input type="email" {...field} />
              {errors.email && (
                <p style={{ color: "red" }}>{errors.email.message}</p>
              )}
            </div>
          )}
        />
        <Controller
          name="password"
          control={control}
          defaultValue=""
          rules={{ required: "パスワードは必須です" }}
          render={({ field }) => (
            <div>
              <label>パスワード:</label>
              <input type="password" {...field} />
              {errors.password && (
                <p style={{ color: "red" }}>{errors.password.message}</p>
              )}
            </div>
          )}
        />
        <Controller
          name="passwordConfirmation"
          control={control}
          defaultValue=""
          rules={{ required: "パスワード確認は必須です" }}
          render={({ field }) => (
            <div>
              <label>パスワード確認:</label>
              <input type="password" {...field} />
              {errors.passwordConfirmation && (
                <p style={{ color: "red" }}>
                  {errors.passwordConfirmation.message}
                </p>
              )}
            </div>
          )}
        />
        <Controller
          name="fullName"
          control={control}
          defaultValue=""
          rules={{ required: "フルネームは必須です" }}
          render={({ field }) => (
            <div>
              <label>フルネーム:</label>
              <input type="text" {...field} />
              {errors.fullName && (
                <p style={{ color: "red" }}>{errors.fullName.message}</p>
              )}
            </div>
          )}
        />
        <Controller
          name="birthDate"
          control={control}
          defaultValue=""
          rules={{ required: "生年月日は必須です" }}
          render={({ field }) => (
            <div>
              <label>生年月日:</label>
              <input type="date" {...field} />
              {errors.birthDate && (
                <p style={{ color: "red" }}>{errors.birthDate.message}</p>
              )}
            </div>
          )}
        />
        <Controller
          name="gender"
          control={control}
          defaultValue=""
          rules={{ required: "性別は必須です" }}
          render={({ field }) => (
            <div>
              <label>性別:</label>
              <input type="text" {...field} />
              {errors.gender && (
                <p style={{ color: "red" }}>{errors.gender.message}</p>
              )}
            </div>
          )}
        />
        <Controller
          name="phoneNumber"
          control={control}
          defaultValue=""
          rules={{ required: "電話番号は必須です" }}
          render={({ field }) => (
            <div>
              <label>電話番号:</label>
              <input type="text" {...field} />
              {errors.phoneNumber && (
                <p style={{ color: "red" }}>{errors.phoneNumber.message}</p>
              )}
            </div>
          )}
        />
        <Controller
          name="postalCode"
          control={control}
          defaultValue=""
          rules={{ required: "郵便番号は必須です" }}
          render={({ field }) => (
            <div>
              <label>郵便番号:</label>
              <input type="text" {...field} />
              {errors.postalCode && (
                <p style={{ color: "red" }}>{errors.postalCode.message}</p>
              )}
            </div>
          )}
        />
        <Controller
          name="address"
          control={control}
          defaultValue=""
          rules={{ required: "住所は必須です" }}
          render={({ field }) => (
            <div>
              <label>住所:</label>
              <input type="text" {...field} />
              {errors.address && (
                <p style={{ color: "red" }}>{errors.address.message}</p>
              )}
            </div>
          )}
        />
        <Controller
          name="avatar"
          control={control}
          defaultValue={null}
          render={({ field }) => (
            <div>
              <label>プロフィール画像:</label>
              <input
                type="file"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    field.onChange(files[0]);
                    handleAvatarChange(files);
                  }
                }}
              />
              {avatarPreview && (
                <div className={styles["avatar-preview"]}>
                  <img
                    src={avatarPreview}
                    alt="プロフィール画像のプレビュー"
                    className={styles["avatar"]}
                  />
                </div>
              )}
            </div>
          )}
        />
        <button type="submit">サインアップ</button>
      </form>
    </div>
  );
};

export default SignupPage;

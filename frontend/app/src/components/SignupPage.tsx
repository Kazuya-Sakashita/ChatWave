import React, { useState } from "react";
import axios from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import styles from "./SignupPage.module.css";
import { SignupPageState } from "../types/componentTypes";

const SignupPage: React.FC = () => {
  const [name, setName] = useState<SignupPageState["name"]>("");
  const [email, setEmail] = useState<SignupPageState["email"]>("");
  const [password, setPassword] = useState<SignupPageState["password"]>("");
  const [passwordConfirmation, setPasswordConfirmation] =
    useState<SignupPageState["passwordConfirmation"]>("");
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [error, setError] = useState<SignupPageState["error"]>("");
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (password !== passwordConfirmation) {
      setError("パスワードが一致しません");
      return;
    }

    const formData = new FormData();
    formData.append("user[name]", name);
    formData.append("user[email]", email);
    formData.append("user[password]", password);
    formData.append("user[password_confirmation]", passwordConfirmation);
    formData.append("user[profile_attributes][full_name]", fullName);
    formData.append("user[profile_attributes][birth_date]", birthDate);
    formData.append("user[profile_attributes][gender]", gender);
    formData.append("user[profile_attributes][phone_number]", phoneNumber);
    formData.append("user[profile_attributes][postal_code]", postalCode);
    formData.append("user[profile_attributes][address]", address);
    if (avatar) {
      formData.append("user[profile_attributes][avatar]", avatar);
    }

    try {
      await axios.post("/signup", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/confirmation");
    } catch (err) {
      setError("登録に失敗しました");
    }
  };

  return (
    <div className={styles["form-container"]}>
      <h1>サインアップ</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <InputField label="名前" value={name} setValue={setName} required />
        <InputField
          label="メールアドレス"
          type="email"
          value={email}
          setValue={setEmail}
          required
        />
        <InputField
          label="パスワード"
          type="password"
          value={password}
          setValue={setPassword}
          required
        />
        <InputField
          label="パスワード確認"
          type="password"
          value={passwordConfirmation}
          setValue={setPasswordConfirmation}
          required
        />
        <InputField
          label="フルネーム"
          value={fullName}
          setValue={setFullName}
        />
        <InputField
          label="生年月日"
          type="date"
          value={birthDate}
          setValue={setBirthDate}
        />
        <InputField label="性別" value={gender} setValue={setGender} />
        <InputField
          label="電話番号"
          value={phoneNumber}
          setValue={setPhoneNumber}
        />
        <InputField
          label="郵便番号"
          value={postalCode}
          setValue={setPostalCode}
        />
        <InputField label="住所" value={address} setValue={setAddress} />
        <div>
          <label>プロフィール画像:</label>
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                setAvatar(e.target.files[0]);
              }
            }}
          />
        </div>
        <button type="submit">サインアップ</button>
      </form>
    </div>
  );
};

interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  value,
  setValue,
  required = false,
}) => (
  <div>
    <label>{label}:</label>
    <input
      type={type}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      required={required}
    />
  </div>
);

export default SignupPage;

import React, { useState } from "react";
import axios from "../api/axiosConfig";
import styles from "./SignupPage.module.css";
import { SignupPageState } from "../types/componentTypes";

const SignupPage: React.FC = () => {
  const [name, setName] = useState<SignupPageState["name"]>("");
  const [email, setEmail] = useState<SignupPageState["email"]>("");
  const [password, setPassword] = useState<SignupPageState["password"]>("");
  const [passwordConfirmation, setPasswordConfirmation] =
    useState<SignupPageState["passwordConfirmation"]>("");
  const [error, setError] = useState<SignupPageState["error"]>("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (password !== passwordConfirmation) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axios.post("/signup", {
        user: {
          name,
          email,
          password,
          password_confirmation: passwordConfirmation,
        },
      });
      alert("User registered successfully");
    } catch (err) {
      setError("Failed to register");
    }
  };

  return (
    <div className={styles["form-container"]}>
      <h1>Sign Up</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Confirm Password:</label>
          <input
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignupPage;

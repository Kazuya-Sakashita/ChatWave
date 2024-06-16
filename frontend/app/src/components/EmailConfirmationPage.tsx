import React from "react";
import "./EmailConfirmationPage.css"; // 外部CSSファイルを読み込む

const EmailConfirmationPage: React.FC = () => {
  return (
    <div className="confirmation-container">
      <h1 className="confirmation-title">メールを確認してください</h1>
      <p className="confirmation-message">
        ご登録ありがとうございます！メールを確認し、アカウントを有効化するための確認リンクをクリックしてください。
      </p>
    </div>
  );
};

export default EmailConfirmationPage;

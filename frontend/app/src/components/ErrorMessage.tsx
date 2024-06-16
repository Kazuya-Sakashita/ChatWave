// ReactとFC（Functional Component）をインポート
import React from "react";
// ErrorMessageコンポーネントのプロパティの型をインポート
import { ErrorMessageProps } from "../types/componentTypes";

// ErrorMessageコンポーネントを定義
const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  // メッセージがnullまたは空の場合、何も表示しない
  if (!message) return null;

  // メッセージが存在する場合、赤色のテキストでメッセージを表示
  return <p style={{ color: "red" }}>{message}</p>;
};

// ErrorMessageコンポーネントをエクスポート
export default ErrorMessage;

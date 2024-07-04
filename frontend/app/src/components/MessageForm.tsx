import React from "react";
import "../styles/ChatStyles.css";

interface MessageFormProps {
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent) => void;
  handleCancel: () => void; // キャンセルボタンのハンドラ
  formRef: React.RefObject<HTMLFormElement>;
  inputRef: React.RefObject<HTMLInputElement>; // 入力フィールドの参照
  editingMessageId: number | null; // 編集モードのID
}

const MessageForm: React.FC<MessageFormProps> = ({
  newMessage,
  setNewMessage,
  handleSubmit,
  handleCancel, // キャンセルボタンのハンドラを受け取る
  formRef,
  inputRef, // 入力フィールドの参照を受け取る
  editingMessageId, // 編集モードのIDを受け取る
}) => {
  return (
    <form className="form-container" onSubmit={handleSubmit} ref={formRef}>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="メッセージを入力してください..."
        ref={inputRef} // 入力フィールドの参照を設定
      />
      <button type="submit" className="update-button">
        {editingMessageId !== null ? "更新" : "送信"}
      </button>
      {editingMessageId !== null && (
        <button type="button" onClick={handleCancel} className="cancel-button">
          キャンセル
        </button>
      )}
    </form>
  );
};

export default MessageForm;

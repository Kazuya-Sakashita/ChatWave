import React from "react";

interface MessageFormProps {
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent) => void;
  formRef: React.RefObject<HTMLFormElement>;
  inputRef: React.RefObject<HTMLInputElement>; // 入力フィールドの参照
}

const MessageForm: React.FC<MessageFormProps> = ({
  newMessage,
  setNewMessage,
  handleSubmit,
  formRef,
  inputRef, // 入力フィールドの参照を受け取る
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
      <button type="submit">{newMessage ? "更新" : "送信"}</button>
    </form>
  );
};

export default MessageForm;

import React, { useRef } from "react";

interface MessageFormProps {
  newMessage: string;
  setNewMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent) => void;
  formRef: React.RefObject<HTMLFormElement>;
}

const MessageForm: React.FC<MessageFormProps> = ({
  newMessage,
  setNewMessage,
  handleSubmit,
  formRef,
}) => {
  return (
    <form className="form-container" onSubmit={handleSubmit} ref={formRef}>
      <input
        type="text"
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        placeholder="メッセージを入力してください..."
      />
      <button type="submit">{newMessage ? "更新" : "送信"}</button>
    </form>
  );
};

export default MessageForm;

import { useEffect } from "react";
import { createConsumer } from "@rails/actioncable";

const useMessageStatusChannel = (
  userId: number,
  onUpdateStatus: (messageId: number, status: string) => void
) => {
  useEffect(() => {
    const cable = createConsumer("ws://localhost:3000/cable");

    const channel = cable.subscriptions.create(
      { channel: "MessageStatusChannel", user_id: userId },
      {
        received: (data) => {
          // データの内容を確認
          console.log(`Received data from MessageStatusChannel:`, data);

          if (data.message_id && data.status) {
            // 状態が "read" の場合に既読を更新
            onUpdateStatus(data.message_id, data.status);
          } else {
            console.error("Invalid data received:", data);
          }
        },
        connected() {
          console.log(`Connected to MessageStatusChannel for user ${userId}`);
        },
        disconnected() {
          console.log(
            `Disconnected from MessageStatusChannel for user ${userId}`
          );
        },
      }
    );

    return () => {
      console.log(`Unsubscribing from MessageStatusChannel for user ${userId}`);
      channel.unsubscribe();
      cable.disconnect();
    };
  }, [userId, onUpdateStatus]);
};

export default useMessageStatusChannel;

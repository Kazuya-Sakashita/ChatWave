module ReadReceiptService
  # メッセージを既読としてマーク
  def self.mark_as_read(user, message)
    ReadReceipt.create!(
      user: user,
      read_receiptable: message
    )
  end

  # 特定のユーザーがメッセージを既読かどうかを確認
  def self.read?(user, message)
    ReadReceipt.exists?(
      user: user,
      read_receiptable: message
    )
  end

  # 送信者が自分のメッセージについて、受信者が既読かどうかを確認
  def self.message_read_by_recipient?(message)
    recipient = message.recipient_id
    ReadReceipt.exists?(
      user_id: recipient,
      read_receiptable: message
    )
  end
end

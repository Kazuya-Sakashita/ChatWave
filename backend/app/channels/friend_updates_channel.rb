class FriendUpdatesChannel < ApplicationCable::Channel
  def subscribed
    # ユーザーごとに個別のストリームを購読
    stream_for current_user
  end

  def unsubscribed
    # 購読解除時にクリーンアップ処理があればここに記述
  end
end

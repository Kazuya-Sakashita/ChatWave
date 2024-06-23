class MessageChannel < ApplicationCable::Channel
  def subscribed
    # ストリームを開始
    stream_from "message_channel_#{params[:chat_room_type]}_#{params[:chat_room_id]}"
  end

  def unsubscribed
    # クリーンアップ処理
  end

  def receive(data)
    ActionCable.server.broadcast("message_channel_#{params[:chat_room_type]}_#{params[:chat_room_id]}", data)
  end
end

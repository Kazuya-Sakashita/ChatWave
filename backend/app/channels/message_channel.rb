class MessageChannel < ApplicationCable::Channel
  def subscribed
    # ストリームを開始
    stream_from "message_channel_#{params[:chat_room_type]}_#{params[:chat_room_id]}"
  end

  def unsubscribed
    stop_all_streams
  end

  def receive(data)
    ActionCable.server.broadcast("message_channel_#{params[:chat_room_type]}_#{params[:chat_room_id]}", data)
  end
end

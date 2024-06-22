class MessageChannel < ApplicationCable::Channel
  def subscribed
    stream_from "message_channel_#{params[:chat_room_type]}_#{params[:chat_room_id]}"
    Rails.logger.info "Subscribed to message_channel_#{params[:chat_room_type]}_#{params[:chat_room_id]}"
  end

  def unsubscribed
    Rails.logger.info "Unsubscribed from message_channel_#{params[:chat_room_type]}_#{params[:chat_room_id]}"
  end
end

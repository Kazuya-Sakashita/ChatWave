class MessageStatusChannel < ApplicationCable::Channel
  def subscribed
    stream_from "message_status_channel_#{params[:user_id]}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end

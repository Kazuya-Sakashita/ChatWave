class NewMessageNotificationChannel < ApplicationCable::Channel
  def subscribed
    stream_from "new_message_notifications_#{params[:user_id]}"
  end

  def unsubscribed
    stop_all_streams
  end
end

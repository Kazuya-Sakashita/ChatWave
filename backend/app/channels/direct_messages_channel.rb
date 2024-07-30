class DirectMessagesChannel < ApplicationCable::Channel
  def subscribed
    if params[:user_id].present?
      stream_from "direct_messages:#{params[:user_id]}"
      Rails.logger.info "Subscribed to direct_messages:#{params[:user_id]}"
    else
      reject
      Rails.logger.info "Subscription rejected due to missing user_id"
    end
  end

  def unsubscribed
    Rails.logger.info "Unsubscribed from direct_messages:#{params[:user_id]}"
    # Any cleanup needed when channel is unsubscribed
  end
end

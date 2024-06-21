class DirectMessagesController < ApplicationController
  before_action :authenticate_user!

  def index
    direct_messages = DirectMessage.where("sender_id = ? OR recipient_id = ?", current_user.id, current_user.id)
    render json: { direct_messages: direct_messages }
  end

  def show
    direct_message = DirectMessage.find(params[:id])
    render json: { direct_message: direct_message }
  end
end

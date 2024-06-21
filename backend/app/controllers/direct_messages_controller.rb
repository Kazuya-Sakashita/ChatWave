class DirectMessagesController < ApplicationController
  before_action :authenticate_user!

  def index
    direct_messages = DirectMessage.where("sender_id = ? OR recipient_id = ?", current_user.id, current_user.id)
                                   .includes(:sender, :recipient)
    direct_messages_with_usernames = direct_messages.map do |dm|
      {
        id: dm.id,
        sender_id: dm.sender_id,
        recipient_id: dm.recipient_id,
        content: dm.content,
        sender_name: dm.sender.name,
        recipient_name: dm.recipient.name
      }
    end
    render json: { direct_messages: direct_messages_with_usernames }
  end

  def show
    direct_message = DirectMessage.find(params[:id])
    related_messages = DirectMessage.where(
      "(sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)",
      direct_message.sender_id, direct_message.recipient_id,
      direct_message.recipient_id, direct_message.sender_id
    ).order(:created_at)
    render json: { direct_messages: related_messages }
  end

  def create
    direct_message = DirectMessage.new(
      sender_id: current_user.id,
      recipient_id: params[:recipient_id],
      content: params[:content]
    )

    if direct_message.save
      render json: { direct_message: direct_message }, status: :created
    else
      render json: { errors: direct_message.errors.full_messages }, status: :unprocessable_entity
    end
  end
end

class DirectMessagesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_recipient, only: [:create]

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
        recipient_name: dm.recipient.name,
        created_at: dm.created_at.strftime("%Y-%m-%d %H:%M")
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
      recipient_id: @recipient.id,
      content: params[:content]
    )

    if direct_message.save
      formatted_message = format_direct_message(direct_message)
      Rails.logger.info "Broadcasting to: message_channel_direct_#{direct_message.sender_id}_#{direct_message.recipient_id} with #{formatted_message}"
      ActionCable.server.broadcast("message_channel_direct_#{direct_message.sender_id}_#{direct_message.recipient_id}", { direct_message: formatted_message })
      Rails.logger.info "Broadcasting to: message_channel_direct_#{direct_message.recipient_id}_#{direct_message.sender_id} with #{formatted_message}"
      ActionCable.server.broadcast("message_channel_direct_#{direct_message.recipient_id}_#{direct_message.sender_id}", { direct_message: formatted_message })
      render json: { direct_message: formatted_message }, status: :created
    else
      Rails.logger.error "Failed to create direct message: #{direct_message.errors.full_messages.join(', ')}"
      render json: { errors: direct_message.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_recipient
    @recipient = User.find(params[:recipient_id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ["Recipient not found"] }, status: :not_found
  end

  def format_direct_message(direct_message)
    {
      id: direct_message.id,
      sender_id: direct_message.sender_id,
      recipient_id: direct_message.recipient_id,
      content: direct_message.content,
      sender_name: direct_message.sender.name,
      recipient_name: direct_message.recipient.name,
      created_at: direct_message.created_at.strftime("%Y-%m-%d %H:%M")
    }
  end
end

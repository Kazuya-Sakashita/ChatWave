class DirectMessagesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_recipient, only: [:create]
  before_action :set_direct_message, only: [:destroy, :update]

  def index
    direct_messages = DirectMessage.where("sender_id = ? OR recipient_id = ?", current_user.id, current_user.id)
                                   .includes(:sender, :recipient)
    direct_messages_with_usernames = direct_messages.map do |dm|
      format_direct_message(dm)
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
    render json: { direct_messages: related_messages.map { |dm| format_direct_message(dm) } }
  end

  def create
    @direct_message = current_user.sent_direct_messages.new(direct_message_params)
    if @direct_message.save
      broadcast_message(@direct_message, "create")
      render json: { direct_message: format_direct_message(@direct_message) }, status: :created
    else
      render json: @direct_message.errors, status: :unprocessable_entity
    end
  end

  def update
    if @direct_message.update(direct_message_params)
      broadcast_message(@direct_message, "update")
      render json: { direct_message: format_direct_message(@direct_message) }
    else
      render json: @direct_message.errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @direct_message.destroy
      broadcast_message(@direct_message, "delete")
      head :no_content
    else
      render json: @direct_message.errors, status: :unprocessable_entity
    end
  end

  private

  def direct_message_params
    params.require(:direct_message).permit(:recipient_id, :content)
  end

  def set_recipient
    @recipient = User.find(params[:direct_message][:recipient_id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ["Recipient not found"] }, status: :not_found
  end

  def set_direct_message
    @direct_message = DirectMessage.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: ["Direct message not found"] }, status: :not_found
  end

  def format_direct_message(direct_message)
    {
      id: direct_message.id,
      sender_id: direct_message.sender_id,
      recipient_id: direct_message.recipient_id,
      content: direct_message.content,
      sender_name: direct_message.sender.name,
      recipient_name: direct_message.recipient.name,
      created_at: direct_message.created_at.strftime("%Y-%m-%d %H:%M"),
      edited: direct_message.updated_at > direct_message.created_at
    }
  end

  def broadcast_message(message, action)
    ActionCable.server.broadcast "direct_messages:#{message.recipient_id}", { direct_message: format_direct_message(message), action: action }
    ActionCable.server.broadcast "direct_messages:#{message.sender_id}", { direct_message: format_direct_message(message), action: action }
  end
end

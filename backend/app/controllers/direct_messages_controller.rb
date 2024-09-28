class DirectMessagesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_recipient, only: [:create]
  before_action :set_direct_message, only: [:destroy, :update]

  def index
    direct_messages = DirectMessage.where("sender_id = ? OR recipient_id = ?", current_user.id, current_user.id)
                                   .includes(:sender, :recipient)

    direct_messages.each do |message|
      mark_message_as_read(message)
    end

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

    related_messages.each do |message|
      mark_message_as_read(message)
    end

    render json: {
      direct_messages: related_messages.map { |dm| format_direct_message(dm) },
    }
  end

  def create
    @direct_message = current_user.sent_direct_messages.new(direct_message_params)
    if @direct_message.save
      set_new_message_flag_for_direct(@direct_message)
      broadcast_new_message(@direct_message)
      render json: { direct_message: format_direct_message(@direct_message) }, status: :created
    else
      render json: @direct_message.errors, status: :unprocessable_entity
    end
  end

  def new_messages
    user_id = current_user.id
    direct_new_messages = {}

    DirectMessage.where("sender_id = ? OR recipient_id = ?", user_id, user_id).find_each do |dm|
      key = "direct:#{dm.id}:new_messages"
      if redis.hexists(key, user_id)
        direct_new_messages[dm.sender_id == user_id ? dm.recipient_id : dm.sender_id] = true
      end
    end

    render json: { new_messages: direct_new_messages }
  end

  def clear_new_messages
    sender_id = params[:sender_id]
    recipient_id = current_user.id

    begin
      redis.hdel("direct:#{sender_id}:new_messages", recipient_id)
      render json: { message: 'New messages cleared' }, status: :ok
    rescue => e
      render json: { error: 'Failed to clear new messages' }, status: :internal_server_error
    end
  end

  def update
    if @direct_message.update(direct_message_params)
      broadcast_new_message(@direct_message, "update")
      render json: { direct_message: format_direct_message(@direct_message) }
    else
      render json: @direct_message.errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @direct_message.destroy
      broadcast_new_message(@direct_message, "delete")
      head :no_content
    else
      render json: @direct_message.errors, status: :unprocessable_entity
    end
  end

  def mark_as_read
    message_ids = params[:message_ids]
    messages = DirectMessage.where(id: message_ids, recipient_id: current_user.id)

    messages.each do |message|
      mark_message_as_read(message)
    end

    head :ok
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
      edited: direct_message.updated_at > direct_message.created_at,
      is_read: message_read_by_recipient?(direct_message)
    }
  end

  def broadcast_new_message(message, action = "create")
    recipient_stream = "new_message_notifications_#{message.recipient_id}"
    sender_stream = "new_message_notifications_#{message.sender_id}"
    ActionCable.server.broadcast recipient_stream, { sender_id: message.sender_id }
    ActionCable.server.broadcast sender_stream, { sender_id: message.sender_id }
    ActionCable.server.broadcast "direct_messages:#{message.recipient_id}", { direct_message: format_direct_message(message), action: action }
    ActionCable.server.broadcast "direct_messages:#{message.sender_id}", { direct_message: format_direct_message(message), action: action }
  end

  def set_new_message_flag_for_direct(message)
    redis.hset("direct:#{message.sender_id}:new_messages", message.recipient_id, "1")
  end

  def redis
    @redis ||= Redis.new
  end

  def mark_message_as_read(message)
    return if message.read_by?(current_user)

    message.read_receipts.create!(user: current_user)

    # 既読情報を送信者に通知
    Rails.logger.info "Broadcasting read status for message #{message.id} to user #{message.sender_id}"
    ActionCable.server.broadcast("message_status_channel_#{message.sender_id}", {
      message_id: message.id,
      status: "read",
      recipient_id: current_user.id
    })

    # 全クライアントに既読情報をブロードキャスト
    ActionCable.server.broadcast "direct_messages:#{message.sender_id}", {
      direct_message: format_direct_message(message),
      action: "update_read_status"
    }
  end

  def message_read_by_recipient?(message)
    ReadReceipt.exists?(user_id: message.recipient_id, read_receiptable: message)
  end
end

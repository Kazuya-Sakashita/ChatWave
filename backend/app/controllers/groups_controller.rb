class GroupsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_group, only: [:show, :create_message, :update_message, :destroy_message, :clear_new_messages]

  def show
    messages = @group.messages.includes(:sender).map do |message|
      begin
        # メッセージが未読の場合は既読にする
        if message_unread?(message)
          mark_message_as_read(message)
        end
      rescue => e
        Rails.logger.error "Failed to mark message #{message.id} as read: #{e.message}"
      end

      format_message(message)
    end

    clear_new_message_flag_for_current_user

    # グループの人数を取得
    total_group_members = @group.members.count

    render json: { group: @group, messages: messages }
  end

  def create_message
    Rails.logger.info "Create message params: #{params.inspect}"

    message = @group.messages.build(
      sender: current_user,
      content: params[:content]
    )

    if message.save
      formatted_message = format_message(message)
      ActionCable.server.broadcast("message_channel_group_#{@group.id}", { message: formatted_message })
      set_new_message_flag_for_group(message.sender_id)
      @group.members.each do |member|
        next if member.id == message.sender_id
        ActionCable.server.broadcast("new_message_notifications_#{member.id}", { group_id: @group.id, sender_id: message.sender_id })
      end
      render json: { message: formatted_message }, status: :created
    else
      Rails.logger.error "Failed to save message: #{message.errors.full_messages.join(", ")}"
      render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def new_messages
    user_id = current_user.id
    group_new_messages = {}

    Group.all.each do |group|
      key = "group:#{group.id}:new_messages"
      if redis.hexists(key, user_id)
        group_new_messages[group.id] = true
      end
    end

    render json: { new_messages: group_new_messages }
  end

  def clear_new_messages
    Rails.logger.info "Clearing new messages for group #{params[:id]} and user #{current_user.id}"
    redis.hdel("group:#{params[:id]}:new_messages", current_user.id)
    render json: { message: 'New messages cleared' }, status: :ok
  rescue => e
    Rails.logger.error "Failed to clear new messages: #{e.message}"
    render json: { error: 'Failed to clear new messages' }, status: :internal_server_error
  end

  def update_message
    Rails.logger.info "Update params: #{params.inspect}"

    message = @group.messages.find_by(id: params[:id])

    if message.nil?
      Rails.logger.error "Message not found in the group"
      render json: { error: 'Message not found in the group' }, status: :not_found
      return
    end

    if message.update(content: params[:content])
      formatted_message = format_message(message)
      ActionCable.server.broadcast("message_channel_group_#{@group.id}", { message: formatted_message })
      render json: { message: formatted_message }, status: :ok
    else
      render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy_message
    Rails.logger.info "Delete params: #{params.inspect}"

    message = @group.messages.find_by(id: params[:id])

    if message.nil?
      Rails.logger.error "Message not found in the group"
      render json: { error: 'Message not found in the group' }, status: :not_found
      return
    end

    if message.destroy
      ActionCable.server.broadcast("message_channel_group_#{@group.id}", { action: "delete", message_id: message.id })
      render json: { message: 'Message deleted successfully' }, status: :ok
    else
      render json: { errors: 'Failed to delete the message' }, status: :unprocessable_entity
    end
  end

  def mark_message_as_read(message)
    # 未読メッセージの場合のみ既読にする
    unless ReadReceipt.exists?(user: current_user, read_receiptable: message)
      message.read_receipts.create!(user: current_user)

      # ログを追加して処理の確認
      Rails.logger.info "Marked message #{message.id} as read by user #{current_user.id}"

      # 既読人数をフロントエンドに通知
      broadcast_read_receipt_update(message)
    end
  end

  def mark_as_read
    # group_id パラメータを使用してグループを設定
    @group = Group.find_by(id: params[:group_id])

    if @group.nil?
      render json: { error: 'Group not found' }, status: :not_found and return
    end

    message = Message.find_by(id: params[:message_id])

    if message && message_unread?(message)
      mark_message_as_read(message)
      broadcast_read_receipt_update(message)
      render json: { success: true }
    else
      render json: { error: 'Message not found or already read' }, status: :not_found
    end
  end

  # 既読情報をリアルタイムでブロードキャストするメソッド
  def broadcast_read_receipt_update(message)
    readers_count = message.read_receipts.count
    total_group_members = @group.members.count

    # ログの追加
    Rails.logger.info "Broadcasting read receipt update for message #{message.id} to group #{@group.id} with readers_count: #{readers_count}"

    # グループの全メンバーが購読するチャネルに対してブロードキャスト
    ActionCable.server.broadcast(
      "message_channel_group_#{@group.id}",
      {
        message_id: message.id,
        readers_count: readers_count,
        total_group_members: total_group_members,
        action: "update_read_count"
      }
    )
  end

  private

  def set_group
    @group = Group.find_by(id: params[:group_id] || params[:id])
    unless @group
      render json: { error: "Group not found" }, status: :not_found
    end
  end

  def format_message(message)
    {
      id: message.id,
      sender_id: message.sender_id,
      content: message.content,
      sender_name: message.sender.name,
      created_at: message.created_at.strftime("%Y-%m-%d %H:%M"),
      edited: message.updated_at > message.created_at,
      readers_count: message.read_receipts.count, # 既読人数
      total_group_members: @group.members.count # グループのメンバー数
    }
  end

  def set_new_message_flag_for_group(sender_id)
    @group.members.each do |member|
      next if member.id == sender_id # 送信者には新着メッセージフラグを設定しない
      redis.hset("group:#{@group.id}:new_messages", member.id, "1")
    end
  end

  def clear_new_message_flag_for_current_user
    redis.hdel("group:#{@group.id}:new_messages", current_user.id)
  end

  # 既読のチェック
def message_unread?(message)
  !ReadReceipt.exists?(user: current_user, read_receiptable: message)
end

  # メッセージの既読をマークする
  def mark_message_as_read(message)
    unless ReadReceipt.exists?(user: current_user, read_receiptable: message)
      message.read_receipts.create!(user: current_user)
      Rails.logger.info "Marked message #{message.id} as read by user #{current_user.id}"
      broadcast_read_receipt_update(message)
    end
  end

  # 既読情報をリアルタイムでブロードキャストするメソッド
  def broadcast_read_receipt_update(message)
    return unless @group # @groupがnilでないことを確認

    readers_count = message.read_receipts.count
    total_group_members = @group.members.count

    Rails.logger.info "Broadcasting read receipt update for message #{message.id} to group #{@group.id} with readers_count: #{readers_count}"

    ActionCable.server.broadcast(
      "message_channel_group_#{@group.id}",
      {
        message_id: message.id,
        readers_count: readers_count,
        total_group_members: total_group_members,
        action: "update_read_count"
      }
    )
  end

  def redis
    @redis ||= Redis.new
  end
end

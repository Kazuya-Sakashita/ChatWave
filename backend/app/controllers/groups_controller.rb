class GroupsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_group, only: [:show, :create_message, :update_message, :destroy_message]

  def show
    messages = @group.messages.includes(:sender).map do |message|
      format_message(message)
    end
    render json: { group: @group, messages: messages }
  end

  def create_message
    message = @group.messages.build(
      sender: current_user,
      content: params[:content]
    )

    if message.save
      formatted_message = format_message(message)
      ActionCable.server.broadcast("message_channel_group_#{@group.id}", { message: formatted_message })
      render json: { message: formatted_message }, status: :created
    else
      render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # 既存のメッセージを更新するアクション
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


  private

  # グループを取得するメソッド
  def set_group
    @group = Group.find(params[:group_id] || params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Group not found" }, status: :not_found
  end

  def format_message(message)
    {
      id: message.id,
      sender_id: message.sender_id,
      content: message.content,
      sender_name: message.sender.name,
      created_at: message.created_at.strftime("%Y-%m-%d %H:%M")
    }
  end
end

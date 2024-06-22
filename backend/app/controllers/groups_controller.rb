class GroupsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_group, only: [:show, :create_message]

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

  private

  def set_group
    @group = Group.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Group not found" }, status: :not_found
  end

  def format_message(message)
    {
      id: message.id,
      sender_name: message.sender.name,
      content: message.content,
      created_at: message.created_at.strftime("%Y-%m-%d %H:%M")
    }
  end
end

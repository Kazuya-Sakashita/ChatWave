class GroupsController < ApplicationController
  before_action :authenticate_user!

  def show
    group = Group.find(params[:id])
    messages = group.messages.includes(:sender).map do |message|
      {
        id: message.id,
        sender_name: message.sender.name,
        content: message.content,
        created_at: message.created_at.strftime("%Y-%m-%d %H:%M")
      }
    end
    render json: { group: group, messages: messages }
  end

  def create_message
    group = Group.find(params[:id])
    message = group.messages.build(
      sender: current_user,
      content: params[:content]
    )

    if message.save
      render json: { message: {
        id: message.id,
        sender_name: message.sender.name,
        content: message.content,
        created_at: message.created_at.strftime("%Y-%m-%d %H:%M")
      }}, status: :created
    else
      render json: { errors: message.errors.full_messages }, status: :unprocessable_entity
    end
  end
end

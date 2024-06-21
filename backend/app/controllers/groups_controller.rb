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
end

class ChatsController < ApplicationController
  before_action :authenticate_user!

  def index
    @groups = current_user.groups
    @direct_messages = DirectMessage.where("sender_id = ? OR recipient_id = ?", current_user.id, current_user.id)
    render json: { groups: @groups, direct_messages: @direct_messages }
  end
end

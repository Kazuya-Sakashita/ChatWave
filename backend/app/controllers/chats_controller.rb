class ChatsController < ApplicationController
  before_action :authenticate_user!

  def index
    @groups = current_user.groups
    @direct_messages = DirectMessage.where("sender_id = ? OR recipient_id = ?", current_user.id, current_user.id)
                                    .includes(:sender, :recipient)
    direct_messages_with_usernames = @direct_messages.map do |dm|
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
    render json: { groups: @groups, direct_messages: direct_messages_with_usernames }
  end
end

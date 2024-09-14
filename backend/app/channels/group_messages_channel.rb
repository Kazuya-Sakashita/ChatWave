# app/channels/group_messages_channel.rb
class GroupMessagesChannel < ApplicationCable::Channel
  def subscribed
    group = Group.find(params[:group_id])
    stream_from "group_messages_#{group.id}"
  end

  def unsubscribed
    # チャンネルから切断されたときの処理
  end
end

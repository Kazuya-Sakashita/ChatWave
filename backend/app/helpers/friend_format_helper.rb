module FriendFormatHelper
  def format_pending_request(friend, current_user, type)
    other_user = friend.user_id == current_user.id ? friend.friend : friend.user
    {
      id: friend.id,
      name: other_user.name,
      email: other_user.email,
      avatar_url: other_user.avatar_url,
      status: type
    }
  end
end

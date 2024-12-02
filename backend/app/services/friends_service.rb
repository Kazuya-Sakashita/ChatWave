class FriendsService
  def initialize(current_user)
    @current_user = current_user
  end

  def fetch_friend_lists
    following_friends = Friend.where(user_id: @current_user.id, state: 'accepted').distinct
    follower_friends = Friend.where(friend_id: @current_user.id, state: 'accepted').distinct

    confirmed_friends = (following_friends + follower_friends).map do |friend|
      friend_user = friend.user_id == @current_user.id ? friend.friend : friend.user
      {
        id: friend_user.id,
        name: friend_user.name,
        email: friend_user.email,
        avatar_url: friend_user.avatar_url,
        is_sender: friend.user_id == @current_user.id,
        is_mutual: following_friends.exists?(friend_id: friend_user.id) &&
                    follower_friends.exists?(user_id: friend_user.id)
      }
    end.uniq { |f| f[:id] }

    pending_requests_sent = Friend.where(user_id: @current_user.id, state: 'pending')
    pending_requests_received = Friend.where(friend_id: @current_user.id, state: 'pending')
    blocked_friends = @current_user.blocking

    {
      confirmed_friends: confirmed_friends,
      pending_requests_sent: pending_requests_sent,
      pending_requests_received: pending_requests_received,
      blocked_friends: blocked_friends
    }
  end
end

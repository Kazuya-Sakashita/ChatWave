class FriendsController < ApplicationController
  include FriendFormatHelper

  before_action :authenticate_user!
  before_action :set_friend, only: [:update, :cancel]
  before_action :set_user_to_block_or_unblock, only: [:block, :unblock]

  def index
    service = FriendsService.new(current_user)
    friend_lists = service.fetch_friend_lists

render json: {
  confirmed_friends: friend_lists[:confirmed_friends],
  pending_requests_sent: friend_lists[:pending_requests_sent].map { |friend| format_pending_request(friend, current_user, 'sent') },
  pending_requests_received: friend_lists[:pending_requests_received].map { |friend| format_pending_request(friend, current_user, 'received') },
  blocked_friends: friend_lists[:blocked_friends].map { |user| format_blocked_friend(user) }
}
  end

  # フレンドリクエスト送信
  def create
    service = FriendsService.new(current_user)
    result = service.create_friend_request(params[:friend_id])

    if result[:success]
      render json: { message: result[:message] }, status: :created
    else
      render json: { error: result[:error] }, status: :unprocessable_entity
    end
  end

  # フレンド申請の承認・拒否・キャンセル時にリアルタイム通知を送信
  def update
    service = FriendsService.new(current_user)
    result = service.update_friend_request(@friend, params[:action_type])

    if result[:success]
      render json: { message: result[:message] }, status: :ok
    else
      render json: { error: result[:error] }, status: :unprocessable_entity
    end
  end


  # ブロック処理
  def block
    service = FriendsService.new(current_user)
    result = service.block_user(@user_to_block_or_unblock)

    if result[:success]
      render json: { message: result[:message] }, status: :ok
    else
      render json: { error: result[:error] }, status: :unprocessable_entity
    end
  end

  # ブロック解除処理
  def unblock
    service = FriendsService.new(current_user)
    result = service.unblock_user(@user_to_block_or_unblock)

    if result[:success]
      render json: { message: result[:message] }, status: :ok
    else
      render json: { error: result[:error] }, status: :unprocessable_entity
    end
  end

  # 承認待ちフレンドリクエストのリストを取得するアクション
  def pending_requests
    pending_requests = Friend.where(friend_id: current_user.id, state: 'pending')
    render json: pending_requests
  end

  # ブロックされたフレンドのリストを取得
  def blocked_friends
    blocked_friends = current_user.blocking
    render json: blocked_friends, status: :ok
  end

  # フレンドリクエスト一覧
  def requests
    sent_requests = current_user.friendships.where(state: 'pending', user_id: current_user.id)
    received_requests = current_user.inverse_friendships.where(state: 'pending', friend_id: current_user.id)

    render json: {
      sent_requests: sent_requests.as_json(include: { friend: { only: [:id, :name, :avatar_url] } }),
      received_requests: received_requests.as_json(include: { user: { only: [:id, :name, :avatar_url] } })
    }
  end

  private
  def set_user_to_block_or_unblock
    @user_to_block_or_unblock = User.find(params[:id])
  end

  def set_friend
    @friend = Friend.find(params[:id])
  end

  def broadcast_friend_update(sender_id, receiver_id, status)
    # 送信者に通知
    FriendUpdatesChannel.broadcast_to(
      User.find(sender_id),
      { message: 'friend_updated', status: status }
    )

    # 受信者に通知
    FriendUpdatesChannel.broadcast_to(
      User.find(receiver_id),
      { message: 'friend_updated', status: status }
    )
  end

  def broadcast_block_update(blocker_id, blocked_id, status)
    # ブロックまたはブロック解除された際にリアルタイム通知
    FriendUpdatesChannel.broadcast_to(
      User.find(blocker_id),
      { message: 'block_status_changed', status: status }
    )
    FriendUpdatesChannel.broadcast_to(
      User.find(blocked_id),
      { message: 'block_status_changed', status: status }
    )
  end

  # 承認済みフレンドのフォーマット
  def format_confirmed_friend(friend)
    target_user = friend.user_id == current_user.id ? friend.friend : friend.user
    {
      id: target_user.id,
      name: target_user.name,
      email: target_user.email,
      is_mutual: mutual_friend?(target_user) # 相互フレンドかどうか
    }
  end

  # 相互フレンドかどうかを判定する
  def mutual_friend?(other_user)
    friends.exists?(id: other_user.id) && other_user.friends.exists?(id: id)
  end
end

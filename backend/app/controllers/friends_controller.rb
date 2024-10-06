class FriendsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_friend, only: [:update, :cancel]
  before_action :set_user_to_block_or_unblock, only: [:block, :unblock]

  # フレンドリストとブロックリストを返すアクション
  def index
    # 承認済みフレンドの取得
    confirmed_friends = Friend.where("(user_id = ? OR friend_id = ?) AND state = ?", current_user.id, current_user.id, 'accepted')

    # ペンディング状態のフレンド申請を取得
    pending_requests_sent = Friend.where(user_id: current_user.id, state: 'pending') # 自分が送信したフレンド申請
    pending_requests_received = Friend.where(friend_id: current_user.id, state: 'pending') # 自分が受け取ったフレンド申請

    # ブロックしたフレンドの取得
    blocked_friends = current_user.blocking

    render json: {
      confirmed_friends: confirmed_friends.map { |friend| format_friend(friend) },
      pending_requests_sent: pending_requests_sent.map { |friend| format_pending_request(friend, 'sent') },
      pending_requests_received: pending_requests_received.map { |friend| format_pending_request(friend, 'received') },
      blocked_friends: blocked_friends.map { |user| format_blocked_friend(user) }
    }
  end

  # フレンドリクエスト送信
  def create
    friend = User.find(params[:friend_id])

    # リジェクトされたリクエストがあるか確認
    existing_request = Friend.find_by(user_id: current_user.id, friend_id: friend.id, state: 'rejected')

    if existing_request
      existing_request.update(state: 'pending')
      render json: { message: 'フレンド申請が再度送信されました。' }, status: :ok
    else
      new_request = Friend.new(user_id: current_user.id, friend_id: friend.id, state: 'pending')

      if new_request.save
        render json: { message: 'フレンド申請が送信されました。' }, status: :created
      else
        render json: { error: 'フレンド申請の送信に失敗しました。' }, status: :unprocessable_entity
      end
    end
  end

  # フレンド申請の承認・拒否
  def update
    # authorize @friend

    # params[:action_type]をログに表示
    logger.info "Action Type: #{params[:action_type]}"

    case params[:action_type]
    when 'accept'
      if @friend.accept!
        broadcast_friend_update
        render json: { message: 'フレンド申請を承認しました。' }, status: :ok
      else
        render json: { error: 'フレンド申請の承認に失敗しました。' }, status: :unprocessable_entity
      end
    when 'reject'
      if @friend.reject!
        broadcast_friend_update
        render json: { message: 'フレンド申請を拒否しました。' }, status: :ok
      else
        render json: { error: 'フレンド申請の拒否に失敗しました。' }, status: :unprocessable_entity
      end
    when 'cancel'
      if @friend.destroy
        render json: { message: 'フレンド申請をキャンセルしました。' }, status: :ok
      else
        render json: { error: 'フレンド申請のキャンセルに失敗しました。' }, status: :unprocessable_entity
      end
    else
      render json: { error: '無効なアクションです。' }, status: :unprocessable_entity
    end
  end


  # フレンド申請キャンセルアクション
  def cancel
    if @friend.pending? && @friend.user_id == current_user.id
      @friend.destroy
      render json: { message: 'フレンド申請がキャンセルされました。' }, status: :ok
    else
      render json: { error: 'フレンド申請のキャンセルに失敗しました。' }, status: :unprocessable_entity
    end
  end

  # ブロック処理
  def block
    if current_user.block(@user_to_block_or_unblock)
      render json: { message: 'ユーザーをブロックしました。' }, status: :ok
    else
      render json: { error: 'ユーザーのブロックに失敗しました。' }, status: :unprocessable_entity
    end
  end

  def unblock
    user_to_unblock = User.find(params[:id])

    if current_user.unblock(user_to_unblock)
      render json: { message: 'ユーザーのブロックを解除しました。' }, status: :ok
    else
      render json: { error: 'ブロック解除に失敗しました。' }, status: :unprocessable_entity
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

  def broadcast_friend_update
    FriendListChannel.broadcast_to(current_user, { message: 'friend_updated' })
  end

  def format_friend(friend)
    other_user = friend.user_id == current_user.id ? friend.friend : friend.user
    {
      id: other_user.id,
      name: other_user.name,
      email: other_user.email,
      avatar_url: other_user.avatar_url,
      is_sender: friend.user_id == current_user.id
    }
  end

  def format_pending_request(friend, type)
    other_user = friend.user_id == current_user.id ? friend.friend : friend.user
    {
      id: friend.id,
      name: other_user.name,
      email: other_user.email,
      avatar_url: other_user.avatar_url,
      status: type
    }
  end

  def format_blocked_friend(user)
    {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url
    }
  end
end

class FriendsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_friend, only: [:update]
  before_action :set_user, only: [:block, :unblock]

  # フレンドリストとブロックリストを返すアクション
  def index
    confirmed_friends = Friend.where("(user_id = ? OR friend_id = ?) AND state = ?", current_user.id, current_user.id, 'accepted')
    pending_requests = Friend.where("(user_id = ? OR friend_id = ?) AND state = ?", current_user.id, current_user.id, 'pending')
    blocked_friends = current_user.blocking # ブロックしたユーザーを取得

    render json: {
      confirmed_friends: confirmed_friends.map { |friend| format_friend(friend) },
      pending_requests: pending_requests.map { |friend| format_pending_request(friend) }, # 申請者か受信者か判別
      blocked_friends: blocked_friends.map { |user| format_blocked_friend(user) }
    }
  end

  def create
    friend = User.find(params[:friend_id])

    # リジェクトされたリクエストがあるか確認
    existing_request = Friend.find_by(user_id: current_user.id, friend_id: friend.id, state: 'rejected')

    if existing_request
      # リクエストがリジェクトされていた場合は、ステータスを "pending" に更新
      existing_request.update(state: 'pending')
      render json: { message: 'フレンド申請が再度送信されました。' }, status: :ok
    else
      # 新しいリクエストを作成（リジェクトされていなければ通常の処理）
      new_request = Friend.new(user_id: current_user.id, friend_id: friend.id, state: 'pending')

      if new_request.save
        render json: { message: 'フレンド申請が送信されました。' }, status: :created
      else
        render json: { error: 'フレンド申請の送信に失敗しました。' }, status: :unprocessable_entity
      end
    end
  end

  def update
    authorize @friend

    case params[:action_type]
    when 'accept'
      if @friend.accept!
        FriendListChannel.broadcast_to(current_user, { message: 'friend_updated' })
        render json: { message: 'フレンド申請を承認しました。' }, status: :ok
      else
        render json: { error: 'フレンド申請の承認に失敗しました。' }, status: :unprocessable_entity
      end
    when 'reject'
      if @friend.reject!
        FriendListChannel.broadcast_to(current_user, { message: 'friend_updated' })
        render json: { message: 'フレンド申請を拒否しました。' }, status: :ok
      else
        render json: { error: 'フレンド申請の拒否に失敗しました。' }, status: :unprocessable_entity
      end
    else
      render json: { error: '無効なアクションです。' }, status: :unprocessable_entity
    end
  end

  # フレンド申請キャンセルのアクション
  def cancel
    # 申請者のみキャンセル可能
    if @friend.user_id == current_user.id && @friend.pending?
      @friend.destroy
      render json: { message: 'フレンド申請をキャンセルしました。' }, status: :ok
    else
      render json: { error: 'フレンド申請のキャンセルに失敗しました。' }, status: :unprocessable_entity
    end
  end

  # ブロック処理
  def block
    user_to_block = User.find(params[:id])
    if current_user.block(user_to_block)
      FriendListChannel.broadcast_to(current_user, { message: 'friend_updated' })
      render json: { message: 'ユーザーをブロックしました。' }, status: :ok
    else
      render json: { error: 'ユーザーのブロックに失敗しました。' }, status: :unprocessable_entity
    end
  end

  # ブロック解除処理
  def unblock
    user_to_unblock = User.find(params[:id])
    if current_user.unblock(user_to_unblock)
      FriendListChannel.broadcast_to(current_user, { message: 'friend_updated' })
      render json: { message: 'ユーザーのブロックを解除しました。' }, status: :ok
    else
      render json: { error: 'ユーザーのブロック解除に失敗しました。' }, status: :unprocessable_entity
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

  private

  def set_friend
    @friend = Friend.find(params[:id])
  end

  def friend_params
    params.require(:friend).permit(:friend_id)
  end

  def format_friend(friend)
    other_user = friend.user_id == current_user.id ? friend.friend : friend.user
    is_sender = friend.user_id == current_user.id  # 自分が送信者かどうかを判定
    {
      id: friend.id,
      name: other_user.name,
      email: other_user.email,
      confirmed: friend.confirmed,
      is_sender: is_sender
    }
  end

  def format_pending_request(friend)
    other_user = friend.user_id == current_user.id ? friend.friend : friend.user
    {
      id: friend.id,
      name: other_user.name,
      email: other_user.email,
      is_sender: friend.user_id == current_user.id # 自分が送信者かどうかを判定
    }
  end

  def format_blocked_friend(user)
    {
      id: user.id,
      name: user.name,
      email: user.email
    }
  end

  def set_user
    friend = Friend.find(params[:id])
    @friend_user = friend.user_id == current_user.id ? friend.friend : friend.user
  end
end

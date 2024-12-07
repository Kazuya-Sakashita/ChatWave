class FriendsService
  include FriendFormatHelper # フレンドリクエストやブロックのフォーマット処理を提供するモジュール

  def initialize(current_user)
    @current_user = current_user # 現在ログインしているユーザー
  end

  # フレンドリストとリクエストの一覧を取得するメソッド
  def fetch_friend_lists
    # 現在のユーザーが送信した承認済みフレンドリクエストを取得
    following_friends = Friend.where(user_id: @current_user.id, state: 'accepted').distinct
    # 現在のユーザーが受信した承認済みフレンドリクエストを取得
    follower_friends = Friend.where(friend_id: @current_user.id, state: 'accepted').distinct

    # 承認済みのフレンドリストを生成
    confirmed_friends = (following_friends + follower_friends).map do |friend|
      friend_user = friend.user_id == @current_user.id ? friend.friend : friend.user # 送信者または受信者を特定
      {
        id: friend_user.id,
        name: friend_user.name,
        email: friend_user.email,
        avatar_url: friend_user.avatar_url,
        is_sender: friend.user_id == @current_user.id, # 現在のユーザーが送信者かどうかを判断
        is_mutual: following_friends.exists?(friend_id: friend_user.id) &&
                   follower_friends.exists?(user_id: friend_user.id) # 双方向フレンドか確認
      }
    end.uniq { |f| f[:id] } # 重複を排除

    # ペンディング状態のフレンドリクエストを取得（送信済みと受信済み）
    pending_requests_sent = Friend.where(user_id: @current_user.id, state: 'pending')
    pending_requests_received = Friend.where(friend_id: @current_user.id, state: 'pending')

    # 現在のユーザーがブロックしたユーザー一覧を取得
    blocked_friends = @current_user.blocking

    # フレンドリストの結果を返す
    {
      confirmed_friends: confirmed_friends,
      pending_requests_sent: pending_requests_sent,
      pending_requests_received: pending_requests_received,
      blocked_friends: blocked_friends
    }
  end

  # フレンドリクエストを送信するメソッド
  def create_friend_request(friend_id)
    # フレンドリクエストの対象となるユーザーを取得
    friend = User.find(friend_id)

    # 過去に拒否されたリクエストがあるか確認
    existing_request = Friend.find_by(user_id: @current_user.id, friend_id: friend.id, state: 'rejected')

    if existing_request
      # 拒否されたリクエストを再度ペンディング状態に変更
      existing_request.update(state: 'pending')
      { success: true, message: 'フレンド申請が再度送信されました。' }
    else
      # 新しいフレンドリクエストを作成
      new_request = Friend.new(user_id: @current_user.id, friend_id: friend.id, state: 'pending')

      if new_request.save
        { success: true, message: 'フレンド申請が送信されました。' }
      else
        { success: false, error: 'フレンド申請の送信に失敗しました。' }
      end
    end
  rescue ActiveRecord::RecordNotFound => e
    # ユーザーが見つからなかった場合のエラーハンドリング
    { success: false, error: "ユーザーが見つかりません: #{e.message}" }
  rescue StandardError => e
    # その他のエラーに対するハンドリング
    { success: false, error: "エラーが発生しました: #{e.message}" }
  end

  # フレンドリクエストの状態を更新するメソッド（承認、拒否、キャンセル）
  def update_friend_request(friend, action_type)
    case action_type
    when 'accept'
      if friend.accept!
        broadcast_friend_update(friend.user_id, friend.friend_id, 'accepted') # 承認通知を送信
        { success: true, message: 'フレンド申請を承認しました。' }
      else
        { success: false, error: 'フレンド申請の承認に失敗しました。' }
      end
    when 'reject'
      if friend.reject!
        broadcast_friend_update(friend.user_id, friend.friend_id, 'rejected') # 拒否通知を送信
        { success: true, message: 'フレンド申請を拒否しました。' }
      else
        { success: false, error: 'フレンド申請の拒否に失敗しました。' }
      end
    when 'cancel'
      if friend.destroy
        broadcast_friend_update(friend.user_id, friend.friend_id, 'cancelled') # キャンセル通知を送信
        { success: true, message: 'フレンド申請をキャンセルしました。' }
      else
        { success: false, error: 'フレンド申請のキャンセルに失敗しました。' }
      end
    else
      { success: false, error: '無効なアクションです。' }
    end
  end

  # ユーザーをブロックするメソッド
  def block_user(user)
    if @current_user.block(user)
      { success: true, message: 'ユーザーをブロックしました。' }
    else
      { success: false, error: 'ユーザーのブロックに失敗しました。' }
    end
  end

  # ユーザーのブロックを解除するメソッド
  def unblock_user(user)
    if @current_user.unblock(user)
      { success: true, message: 'ユーザーのブロックを解除しました。' }
    else
      { success: false, error: 'ブロック解除に失敗しました。' }
    end
  end

  private

  # フレンドリクエストの状態をリアルタイムに通知するメソッド
  def broadcast_friend_update(blocker_id, blocked_id, status)
    FriendUpdatesChannel.broadcast_to(
      User.find(blocker_id),
      { message: 'block_status_changed', status: status }
    )
    FriendUpdatesChannel.broadcast_to(
      User.find(blocked_id),
      { message: 'block_status_changed', status: status }
    )
  end

  # フレンド情報をフォーマットするヘルパーメソッド
  def format_friend(friend)
    other_user = friend.user_id == @current_user.id ? friend.friend : friend.user
    {
      id: other_user.id,
      name: other_user.name,
      email: other_user.email,
      avatar_url: other_user.avatar_url,
      is_sender: friend.user_id == @current_user.id
    }
  end

  # ブロックしたユーザー情報をフォーマットするメソッド
  def format_blocked_friend(user)
    {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url
    }
  end
end

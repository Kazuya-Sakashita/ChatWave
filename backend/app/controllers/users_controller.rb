class UsersController < ApplicationController
  before_action :authenticate_user!

  def index
    friends = current_user.friendships.where(state: ['accepted', 'pending']).pluck(:friend_id)
    blocked_users = current_user.blocking.pluck(:id)
    rejected_friendships = current_user.friendships.where(state: 'rejected').pluck(:friend_id)

    # 自分以外のユーザーを取得
    users = User.where.not(id: friends + blocked_users + [current_user.id])
                .or(User.where(id: rejected_friendships))

    # avatar_url を含めたユーザー情報を返す
    render json: users.map { |user| user.as_json(only: [:id, :name]).merge(avatar_url: user.avatar_url) }
  end


  def show
    render json: current_user.as_json(methods: :avatar_url), status: :ok
  end

  private

  # 自分自身、既にフレンドになっているユーザー、ブロック関係のユーザー、ペンディング状態のユーザーを除いたユーザーを取得
  def available_users
    User.where.not(id: excluded_user_ids)
  end

  # 除外するユーザーIDのリストを取得
  def excluded_user_ids
    friend_ids + blocked_user_ids + pending_request_ids + [current_user.id]
  end

  # フレンド関係にあるユーザーのIDを取得
  def friend_ids
    Friend.where("(user_id = ? OR friend_id = ?) AND state = ?", current_user.id, current_user.id, 'accepted')
          .pluck(:user_id, :friend_id)
          .flatten
          .uniq - [current_user.id]
  end

  # ブロックしている、もしくはブロックされているユーザーのIDを取得
  def blocked_user_ids
    current_user.blocking.pluck(:id) + current_user.blocked_by.pluck(:id)
  end

  # 既にペンディング状態のフレンド申請を送信したユーザーのIDを取得
  def pending_request_ids
    current_user.friendships.where(state: 'pending').pluck(:friend_id)
  end
end

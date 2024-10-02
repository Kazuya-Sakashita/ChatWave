class UsersController < ApplicationController
  before_action :authenticate_user!

  # 全ユーザーのリストを返すアクション
  def index
    # 自分自身を除外
    users = User.where.not(id: current_user.id)

    # 既にフレンドになっているユーザーを除外
    friend_ids = current_user.friends.pluck(:id)

    # 自分がブロックしている、またはブロックされているユーザーを除外
    blocked_user_ids = current_user.blocking.pluck(:id) + current_user.blockers.pluck(:id)

    # 除外リストを適用してフィルタリング
    users = users.where.not(id: friend_ids + blocked_user_ids)

    render json: users.select(:id, :name)
  end


  def show
    render json: current_user.as_json(methods: :avatar_url), status: :ok
  end

  private

  # 自分自身、既にフレンドになっているユーザー、ブロック関係のユーザーを除いたユーザーを取得
  def available_users
    User.where.not(id: excluded_user_ids)
  end

  # 除外するユーザーIDのリストを取得
  def excluded_user_ids
    friend_ids + blocked_user_ids + [current_user.id]
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
end

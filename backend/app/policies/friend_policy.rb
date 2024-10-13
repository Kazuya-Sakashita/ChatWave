class FriendPolicy < ApplicationPolicy
  def create?
    # フレンドリクエストの送信者または受信者が現在のユーザーであれば、更新を許可
    record.user_id == user.id || record.friend_id == user.id
  end

  def update?
    # フレンドリクエストの送信者または受信者が現在のユーザーであれば、更新を許可
    record.user_id == user.id || record.friend_id == user.id
  end

  class Scope < ApplicationPolicy::Scope
    # NOTE: Be explicit about which records you allow access to!
    # def resolve
    #   scope.all
    # end
  end
end

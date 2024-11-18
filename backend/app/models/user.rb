class User < ApplicationRecord
  # プロフィール
  has_one :profile, class_name: 'Profile', dependent: :destroy

  # Devise 認証
  include Devise::JWT::RevocationStrategies::JTIMatcher
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :confirmable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  # メッセージ関連
  has_many :sent_messages, class_name: "DirectMessage", foreign_key: "sender_id"
  has_many :received_messages, class_name: "DirectMessage", foreign_key: "recipient_id"
  has_many :sent_direct_messages, class_name: 'DirectMessage', foreign_key: 'sender_id'
  has_many :received_direct_messages, class_name: 'DirectMessage', foreign_key: 'recipient_id'

  # フレンドシップ関連
  has_many :friendships, foreign_key: :user_id, class_name: 'Friend'
  has_many :inverse_friendships, foreign_key: :friend_id, class_name: 'Friend'
  has_many :friends, through: :friendships, source: :friend

  # グループ関連
  has_many :group_memberships, class_name: "GroupMember"
  has_many :groups, through: :group_memberships
  has_many :owned_groups, class_name: 'Group', foreign_key: 'owner_id', dependent: :destroy

  # ブロック関係
  has_many :active_block_relationships, class_name: 'BlockRelationship',
    foreign_key: 'blocker_id', dependent: :destroy
  has_many :blocking, through: :active_block_relationships, source: :blocked

  has_many :passive_block_relationships, class_name: 'BlockRelationship',
    foreign_key: 'blocked_id', dependent: :destroy
  has_many :blockers, through: :passive_block_relationships, source: :blocker

  # 通知設定
  has_one :notification_setting, dependent: :destroy

  # バリデーション
  validates :name, presence: true
  validates :email, presence: true, uniqueness: true
  validates :encrypted_password, presence: true

  # ネストした属性を許可
  accepts_nested_attributes_for :profile

  # コールバック
  after_create :create_notification_setting_with_default

  # アバター URL を取得
  def avatar_url
    profile&.avatar&.url
  end

  # 通知設定をデフォルトで作成
  def create_notification_setting_with_default
    create_notification_setting(enabled: true)
  end

  # ブロックするメソッド
  def block(other_user)
    blocking << other_user unless blocking?(other_user)
  end

  # ブロック解除するメソッド
  def unblock(other_user)
    blocking.delete(other_user) if blocking?(other_user)
  end

  # すでにブロックしているかどうかを確認
  def blocking?(other_user)
    blocking.include?(other_user)
  end

  # グループメンバー選択用のメンバーリストを取得
  def selectable_members
    blocked_ids = blocking.pluck(:id)

    User
      .where.not(id: [id, *blocked_ids])
      .select(:id, :name, :email)
      .map { |user| user.attributes.merge(avatar_url: user.avatar_url) }
  end

  # グループに招待可能なフレンドリストを取得
  def inviteable_friends
    friends.where.not(id: blocking.pluck(:id))
  end
end

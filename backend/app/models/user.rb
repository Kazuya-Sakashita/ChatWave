class User < ApplicationRecord
  has_one :profile, class_name: 'Profile', dependent: :destroy

  include Devise::JWT::RevocationStrategies::JTIMatcher
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :confirmable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  has_many :sent_messages, class_name: "DirectMessage", foreign_key: "sender_id"
  has_many :received_messages, class_name: "DirectMessage", foreign_key: "recipient_id"
  has_many :friendships, foreign_key: "user_id", class_name: "Friend"
  has_many :friends, through: :friendships, source: :friend
  has_many :group_memberships, class_name: "GroupMember"
  has_many :groups, through: :group_memberships
  # 送信したダイレクトメッセージ
  has_many :sent_direct_messages, class_name: 'DirectMessage', foreign_key: 'sender_id'
  # 受信したダイレクトメッセージ
  has_many :received_direct_messages, class_name: 'DirectMessage', foreign_key: 'recipient_id'
  has_one :notification_setting, dependent: :destroy

  # 自分がブロックしているユーザーとの関連付け
  has_many :active_block_relationships, class_name: 'BlockRelationship',
    foreign_key: 'blocker_id',
    dependent: :destroy
  has_many :blocking, through: :active_block_relationships, source: :blocked

# 自分がブロックされているユーザーとの関連付け
  has_many :passive_block_relationships, class_name: 'BlockRelationship',
    foreign_key: 'blocked_id',
    dependent: :destroy
  has_many :blockers, through: :passive_block_relationships, source: :blocker


  after_create :create_notification_setting_with_default

  validates :name, presence: true
  validates :email, presence: true, uniqueness: true
  validates :encrypted_password, presence: true

  accepts_nested_attributes_for :profile

  def avatar_url
    if profile&.avatar.present?
      profile.avatar.url
    else
      nil
    end
  end

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
end

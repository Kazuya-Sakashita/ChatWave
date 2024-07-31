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
end

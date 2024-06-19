class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::JTIMatcher
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,:confirmable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  has_many :sent_messages, class_name: "DirectMessage", foreign_key: "sender_id"
  has_many :received_messages, class_name: "DirectMessage", foreign_key: "recipient_id"
  has_many :friendships, foreign_key: "user_id", class_name: "Friend"
  has_many :friends, through: :friendships, source: :friend
  has_many :group_memberships, class_name: "GroupMember"
  has_many :groups, through: :group_membersh

  validates :username, presence: true, uniqueness: true
  validates :email, presence: true, uniqueness: true
  validates :encrypted_password, presence: true
end

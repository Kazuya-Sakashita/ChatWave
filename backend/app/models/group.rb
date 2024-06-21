class Group < ApplicationRecord
  belongs_to :owner, class_name: "User"
  has_many :group_memberships, class_name: "GroupMember"
  has_many :members, through: :group_memberships, source: :user
  has_many :messages, as: :chat_room, dependent: :destroy

  validates :name, presence: true
end

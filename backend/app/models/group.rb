class Group < ApplicationRecord
  belongs_to :owner, class_name: "User"
  has_many :group_memberships, class_name: "GroupMember"
  has_many :members, through: :group_memberships, source: :user

  validates :name, presence: true
end

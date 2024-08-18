class Message < ApplicationRecord
  belongs_to :sender, class_name: "User"
  belongs_to :chat_room, polymorphic: true
  has_many :read_receipts, as: :read_receiptable
  has_many :readers, through: :read_receipts, source: :user

  validates :content, presence: true

  def read_by?(user)
    readers.exists?(user.id)
  end
end

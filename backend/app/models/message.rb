class Message < ApplicationRecord
  belongs_to :sender, class_name: "User", foreign_key: 'sender_id'
  belongs_to :chat_room, polymorphic: true
  has_many :read_receipts, as: :read_receiptable, dependent: :destroy
  has_many :readers, through: :read_receipts, source: :user

  validates :content, presence: true

  def read_by?(user)
    readers.exists?(user.id)
  end
end

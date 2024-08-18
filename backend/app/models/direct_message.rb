class DirectMessage < ApplicationRecord
  belongs_to :sender, class_name: "User"
  belongs_to :recipient, class_name: "User"
  has_many :read_receipts, as: :read_receiptable

  validates :content, presence: true

  def read_by?(user)
    read_receipts.exists?(user_id: user.id)
  end
end

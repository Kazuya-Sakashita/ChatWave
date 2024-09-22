class ReadReceipt < ApplicationRecord
  belongs_to :user
  belongs_to :read_receiptable, polymorphic: true
end

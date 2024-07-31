class Message < ApplicationRecord
  belongs_to :sender, class_name: "User"
  belongs_to :chat_room, polymorphic: true

  validates :content, presence: true
end

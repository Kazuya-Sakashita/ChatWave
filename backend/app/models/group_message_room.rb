class GroupMessageRoom < ApplicationRecord
  has_many :messages, as: :chat_room
  has_many :participants, class_name: "User", through: :messages, source: :sender
end

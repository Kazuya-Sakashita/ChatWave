# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: "Star Wars" }, { name: "Lord of the Rings" }])
#   Character.create(name: "Luke", movie: movies.first)

# db/seeds.rb

require 'faker'

# データをリセット
User.delete_all
Group.delete_all
GroupMember.delete_all
DirectMessage.delete_all
Message.delete_all

# ユーザーの作成
users = User.create!(
  [
    { name: 'user1', email: 'user1@example.com', password: 'password', confirmed_at: Time.now },
    { name: 'user2', email: 'user2@example.com', password: 'password', confirmed_at: Time.now },
    { name: 'user3', email: 'user3@example.com', password: 'password', confirmed_at: Time.now }
  ]
)

# グループの作成
groups = Group.create!(
  [
    { name: 'General', owner_id: users[0].id },
    { name: 'Random', owner_id: users[1].id },
    { name: 'Tech Talk', owner_id: users[2].id }
  ]
)

# グループメンバーの作成
GroupMember.create!(
  [
    { group_id: groups[0].id, user_id: users[0].id },
    { group_id: groups[0].id, user_id: users[1].id },
    { group_id: groups[1].id, user_id: users[1].id },
    { group_id: groups[1].id, user_id: users[2].id },
    { group_id: groups[2].id, user_id: users[2].id },
    { group_id: groups[2].id, user_id: users[0].id }
  ]
)

# ダイレクトメッセージの作成
DirectMessage.create!(
  [
    { sender_id: users[0].id, recipient_id: users[1].id, content: 'Hello User2!' },
    { sender_id: users[1].id, recipient_id: users[0].id, content: 'Hello User1!' },
    { sender_id: users[2].id, recipient_id: users[0].id, content: 'Hi User1!' }
  ]
)

# メッセージの作成（ポリモーフィック）
messages = []

3.times do |i|
  10.times do
    messages << {
      sender_id: users.sample.id,
      chat_room_type: 'Group',
      chat_room_id: groups[i].id,
      content: Faker::Lorem.sentence(word_count: 5) # Fakerを使用してランダムなメッセージを生成
    }
  end
end

Message.create!(messages)

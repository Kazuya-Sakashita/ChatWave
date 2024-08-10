require 'faker'

# データをリセット
# 依存関係を考慮して、関連するデータを先に削除
NotificationSetting.delete_all
Profile.delete_all
User.delete_all
GroupMember.delete_all
Group.delete_all
DirectMessage.delete_all
Message.delete_all

# デフォルトアバターのパス
default_avatar_path = Rails.root.join('app/assets/images/default_avatar.jpeg')

# ユーザーの作成
users = User.create!(
  [
    { name: 'user1', email: 'user1@example.com', password: 'password', confirmed_at: Time.now },
    { name: 'user2', email: 'user2@example.com', password: 'password', confirmed_at: Time.now },
    { name: 'user3', email: 'user3@example.com', password: 'password', confirmed_at: Time.now }
  ]
)

# プロフィールの作成
users.each do |user|
  profile = user.build_profile(
    full_name: Faker::Name.name,
    birth_date: Faker::Date.birthday(min_age: 18, max_age: 65),
    gender: ['男', '女'].sample,
    phone_number: Faker::Number.leading_zero_number(digits: 11),  # 11桁の日本の電話番号
    postal_code: Faker::Number.number(digits: 7),                 # 7桁の日本の郵便番号
    address: Faker::Address.full_address
  )

  # デフォルトアバターを設定
  profile.avatar = File.open(default_avatar_path)

  profile.save!

  # 通知設定の作成
  NotificationSetting.create!(user: user, enabled: true)
end

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
      content: Faker::Lorem.sentence(word_count: 5)
    }
  end
end

Message.create!(messages)

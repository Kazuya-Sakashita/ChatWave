class Profile < ApplicationRecord
  # ユーザーとの関連付けを設定
  belongs_to :user

  # CarrierWaveを使用したアバターのアップロード
  mount_uploader :avatar, AvatarUploader

  # バリデーションの設定
  validates :full_name, presence: true
  validates :birth_date, presence: true
  validates :gender, inclusion: { in: %w(male female other), message: "%{value} is not a valid gender" }
  validates :phone_number, presence: true, format: { with: /\A\d{10,11}\z/ }
  validates :postal_code, presence: true, format: { with: /\A\d{7}\z/ }
  validates :address, presence: true
  validates :avatar, presence: true
end

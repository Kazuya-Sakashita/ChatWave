class Profile < ApplicationRecord
  # ユーザーとの関連付けを設定
  belongs_to :user

  # CarrierWaveを使用したアバターのアップロード
  mount_uploader :avatar, AvatarUploader

  # バリデーションの設定
  # validates :full_name, presence: true
  # validates :birth_date, presence: true
  # validates :gender, presence: true
  # validates :phone_number, presence: true
  # validates :postal_code, presence: true
  # validates :address, presence: true
end

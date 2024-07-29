class User < ApplicationRecord
  has_one :profile, class_name: 'Profile', dependent: :destroy

  include Devise::JWT::RevocationStrategies::JTIMatcher
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable,:confirmable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  accepts_nested_attributes_for :profile

  def avatar_url
    if profile&.avatar.present?
      profile.avatar.url
    else
      nil
    end
  end
end

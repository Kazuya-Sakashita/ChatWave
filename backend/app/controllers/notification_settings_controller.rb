class NotificationSettingsController < ApplicationController
  before_action :authenticate_user!

  def show
    setting = current_user.notification_setting || initialize_notification_setting

    if setting
      render json: { enabled: setting.enabled }, status: :ok
    else
      render json: { error: '通知設定が見つかりません' }, status: :not_found
    end
  end

  def update
    setting = current_user.notification_setting || initialize_notification_setting

    if setting.update(notification_setting_params)
      render json: { enabled: setting.enabled }, status: :ok
    else
      render json: { error: '通知設定の更新に失敗しました' }, status: :unprocessable_entity
    end
  end

  private

  def notification_setting_params
    params.require(:notification_setting).permit(:enabled)
  end

  def initialize_notification_setting
    current_user.create_notification_setting(enabled: true)
  end
end

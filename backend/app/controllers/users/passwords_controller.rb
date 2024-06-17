class Users::PasswordsController < Devise::PasswordsController
  respond_to :json

  def create
    user = User.find_by(email: resource_params[:email])
    if user && user.confirmed_at.nil?
      log_error("Failed to send reset password instructions to #{user.email}: Email not confirmed")
      unconfirmed_email
      return
    end

    self.resource = resource_class.send_reset_password_instructions(resource_params)
    yield resource if block_given?

    if successfully_sent?(resource)
      log_info("Reset password instructions sent to #{resource.email}")
      send_reset_mail_success
    else
      log_error("Failed to send reset password instructions to #{resource.email}: #{resource.errors.full_messages.join(", ")}")
      send_reset_mail_failed(resource)
    end
  end

  def update
    log_info("Received parameters: #{params.inspect}")
    user_params = params.require(:user).permit(:reset_password_token, :password, :password_confirmation)
    log_info("Sanitized parameters: #{user_params.inspect}")

    user = User.find_by(reset_password_token: Devise.token_generator.digest(User, :reset_password_token, user_params[:reset_password_token]))
    log_info("User found: #{user.inspect}")

    if user.nil?
      log_error("Failed to reset password: Reset password token is invalid")
      reset_password_token_invalid
      return
    end

    self.resource = resource_class.reset_password_by_token(user_params)
    if resource.errors.empty?
      resource.unlock_access! if unlockable?(resource)
      reset_password_success
    else
      log_error("Failed to reset password: #{resource.errors.full_messages.join(", ")}")
      reset_password_failed(resource)
    end
  end

  private

  def respond_with(resource, _opts = {})
    if resource.errors.empty?
      reset_password_success
    else
      reset_password_failed(resource)
    end
  end

  def send_reset_mail_success
    render json: { message: 'パスワードリセットメールを送信しました。' }
  end

  def send_reset_mail_failed(resource)
    render json: { message: 'メールの送信に失敗しました。', errors: resource.errors.full_messages }
  end

  def reset_password_success
    render json: { message: 'パスワードが正常にリセットされました。' }
  end

  def reset_password_failed(resource)
    render json: { message: 'パスワードのリセットに失敗しました。', errors: resource.errors.full_messages }
  end

  def reset_password_token_invalid
    render json: { message: 'パスワードのリセットに失敗しました。', errors: ['Reset password token is invalid'] }, status: :unprocessable_entity
  end

  def unconfirmed_email
    render json: { message: 'メールアドレスが確認されていません。' }, status: :unprocessable_entity
  end

  def resource_params
    params.require(:user).permit(:email, :reset_password_token, :password, :password_confirmation)
  end

  def log_info(message)
    Rails.logger.info(message)
  end

  def log_error(message)
    Rails.logger.error(message)
  end
end

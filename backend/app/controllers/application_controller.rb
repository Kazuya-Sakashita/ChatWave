class ApplicationController < ActionController::API
  before_action :configure_permitted_parameters, if: :devise_controller?

  protected


  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: %i[
      name
      email
      password
      password_confirmation
      profile_attributes
    ])

    devise_parameter_sanitizer.permit(:account_update, keys: %i[
      name
      email
      password
      password_confirmation
      current_password
      profile_attributes
    ])
  end
end

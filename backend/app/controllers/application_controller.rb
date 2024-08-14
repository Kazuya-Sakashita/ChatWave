class ApplicationController < ActionController::API
  before_action :configure_permitted_parameters, if: :devise_controller?

end

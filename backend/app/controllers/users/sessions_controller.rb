# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  include RackSessionsFix
  respond_to :json

  def create
    user = User.find_by(email: params[:user][:email])
    if user && user.valid_password?(params[:user][:password])
      sign_in(user)
      token = current_token
      respond_with(user, token)
    else
      render json: { error: 'Invalid Email or Password' }, status: :unauthorized
    end
  end

  def destroy
    logger.info "Attempting to log out user"
    super
  rescue StandardError => e
    logger.error "Logout failed: #{e.message}"
    render json: { error: e.message }, status: :unauthorized
  end

  private

  def respond_with(resource, token)
    render json: {
      status: {
        code: 200,
        message: 'Logged in successfully.',
        data: {
          user: UserSerializer.new(resource).serializable_hash[:data][:attributes],
          token: token
        }
      }
    }, status: :ok
  end

  def respond_to_on_destroy
    if request.headers['Authorization'].present?
      begin
        jwt_payload = JWT.decode(request.headers['Authorization'].split(' ').last, ENV['DEVISE_JWT_SECRET_KEY']).first
        current_user = User.find(jwt_payload['sub'])

        if current_user
          render json: {
            status: 200,
            message: 'Logged out successfully.'
          }, status: :ok
        else
          render json: {
            status: 401,
            message: "Couldn't find an active session."
          }, status: :unauthorized
        end
      rescue JWT::DecodeError => e
        render json: {
          status: 401,
          message: "Invalid token: #{e.message}"
        }, status: :unauthorized
      rescue StandardError => e
        render json: {
          status: 500,
          message: "Internal server error: #{e.message}"
        }, status: :internal_server_error
      end
    else
      render json: {
        status: 401,
        message: "Authorization header missing."
      }, status: :unauthorized
    end
  end

  def current_token
    request.env['warden-jwt_auth.token']
  end
end

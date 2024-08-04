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
      render json: { error: '無効なメールアドレスまたはパスワードです' }, status: :unauthorized
    end
  end

  def destroy
    logger.info "ユーザーのログアウトを試みています"
    super
  rescue StandardError => e
    logger.error "ログアウトに失敗しました: #{e.message}"
    render json: { error: e.message }, status: :unauthorized
  end

  private

  def respond_with(resource, token)
    render json: {
      status: {
        code: 200,
        message: '正常にログインしました',
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
            message: '正常にログアウトしました'
          }, status: :ok
        else
          render json: {
            status: 401,
            message: 'アクティブなセッションが見つかりません'
          }, status: :unauthorized
        end
      rescue JWT::DecodeError => e
        render json: {
          status: 401,
          message: "無効なトークンです: #{e.message}"
        }, status: :unauthorized
      rescue StandardError => e
        render json: {
          status: 500,
          message: "内部サーバーエラーです: #{e.message}"
        }, status: :internal_server_error
      end
    else
      render json: {
        status: 401,
        message: "Authorizationヘッダーが欠落しています"
      }, status: :unauthorized
    end
  end

  def current_token
    request.env['warden-jwt_auth.token']
  end
end

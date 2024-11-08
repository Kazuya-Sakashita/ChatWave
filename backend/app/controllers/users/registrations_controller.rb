class Users::RegistrationsController < Devise::RegistrationsController
  include RackSessionsFix
  respond_to :json
  before_action :configure_permitted_parameters, if: :devise_controller?

  # GET /resource/sign_up
  def new
    @user = User.new
    @user.build_profile
    super
  end

  # POST /resource
  def create
    build_resource(sign_up_params) # `sign_up_params`にprofile_attributesを含める

    resource.save
    yield resource if block_given?
    if resource.persisted?
      sign_up(resource_name, resource)
      respond_with resource, location: after_sign_up_path_for(resource)
    else
      clean_up_passwords resource
      set_minimum_password_length
      respond_with resource
    end
  end

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [
      :name,
      :email,
      :password,
      :password_confirmation,
      profile_attributes: [
        :full_name,
        :birth_date,
        :gender,
        :phone_number,
        :postal_code,
        :address,
        :avatar
      ]
    ])

    devise_parameter_sanitizer.permit(:account_update, keys: [
      :name,
      :email,
      :password,
      :password_confirmation,
      :current_password,
      profile_attributes: [
        :full_name,
        :birth_date,
        :gender,
        :phone_number,
        :postal_code,
        :address,
        :avatar
      ]
    ])
  end

  private

  def respond_with(resource, _opts = {})
    if resource.persisted?
      render json: {
        status: { code: 200, message: 'Signed up successfully.' },
        data: UserSerializer.new(resource).serializable_hash[:data][:attributes]
      }
    else
      render json: {
        status: { message: "User couldn't be created successfully. #{resource.errors.full_messages.to_sentence}" },
        errors: resource.errors.full_messages # 追加: エラー内容を表示
      }, status: :unprocessable_entity
    end
  end


  def sign_up_params
    params.require(:user).permit(
      :name,
      :email,
      :password,
      :password_confirmation,
      profile_attributes: [
        :full_name,
        :birth_date,
        :gender,
        :phone_number,
        :postal_code,
        :address,
        :avatar
      ]
    )
  end
end

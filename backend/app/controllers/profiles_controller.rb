class ProfilesController < ApplicationController
  before_action :authenticate_user!

  def new
    @profile = current_user.build_profile
  end

  def create
    @profile = current_user.build_profile(profile_params)
    if @profile.save
      redirect_to @profile, notice: 'プロフィールが作成されました。'
    else
      render :new
    end
  end

  def edit
    @profile = current_user.profile
  end

  def show
    profile = current_user.profile
    if profile
      Rails.logger.info "プロフィール情報: #{profile.inspect}"
      render json: { profile: profile.as_json(methods: :avatar_url) }, status: :ok
    else
      Rails.logger.error "プロフィールが見つかりません"
      render json: { error: 'プロフィールが見つかりません' }, status: :not_found
    end
  end

  def update
    profile = current_user.profile
    if profile.update(profile_params)
      render json: profile, status: :ok
    else
      render json: { error: 'プロフィールの更新に失敗しました' }, status: :unprocessable_entity
    end
  end

  private

  def profile_params
    params.require(:profile).permit(:full_name, :birth_date, :gender, :phone_number, :postal_code, :address, :avatar)
  end
end

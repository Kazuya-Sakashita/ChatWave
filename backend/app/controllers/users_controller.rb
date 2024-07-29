class UsersController < ApplicationController
  before_action :authenticate_user!

  def show
    render json: current_user.as_json(methods: :avatar_url), status: :ok
  end
end

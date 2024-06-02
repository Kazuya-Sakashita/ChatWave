class HomeController < ApplicationController
  before_action :authenticate_user!

  def index
    render json: { message: "Welcome to ChatWave" }
  end
end

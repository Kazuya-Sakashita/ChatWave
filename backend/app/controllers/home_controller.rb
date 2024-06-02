class HomeController < ApplicationController
  def index
    render json: { message: "Welcome to ChatWave" }
  end
end

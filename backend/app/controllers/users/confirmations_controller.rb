# frozen_string_literal: true

class Users::ConfirmationsController < Devise::ConfirmationsController
  respond_to :json

  private

  def respond_with(resource, _opts = {})
    confirmation_success && return if resource.present?

    confirmation_failed
  end

  def confirmation_success
    render json: { message: 'confirmation sucessfully.' }
  end

  def confirmation_failed
    render json: { message: "Something went wrong." }
  end
end

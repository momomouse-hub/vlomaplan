class Api::IdentitiesController < ApplicationController
  def show
    ensure_visitor if params[:ensure].present? && current_user.nil?

    render json: {
      user_id: current_user.id,
      token: visitor_token
    }
  end
end

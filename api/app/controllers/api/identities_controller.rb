class Api::IdentitiesController < ApplicationController
  def show
    render json: {
      user_id: current_user.id,
      token: visitor_token || request.headers['X-Visitor-Token']
    }
  end
end
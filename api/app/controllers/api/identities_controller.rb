class Api::IdentitiesController < ApplicationController
  def show
    response.set_header('X-Visitor-Token', visitor_token)
    render json: {
      user_id: current_user.id,
      token: visitor_token || request.headers['X-Visitor-Token']
    }
  end
end
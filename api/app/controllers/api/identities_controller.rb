class Api::IdentitiesController < ApplicationController
  def show
    ensure_visitor if params[:ensure].present? && current_user.nil?

    response.set_header('X-Visitor-Token', visitor_token) if visitor_token.present?

    is_registered =
      if current_user
        current_user.respond_to?(:user_credential) ? current_user.user_credential.present? : false
      else
        false
      end

    render json: {
      registered: is_registered
    }
  end
end

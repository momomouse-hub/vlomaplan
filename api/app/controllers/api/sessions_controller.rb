class Api::SessionsController < ApplicationController
  def create
    email = params.require(:email).to_s.downcase
    password = params.require(:password)

    uc = UserCredential.find_by(email: email)
    unless uc&.authenticate(password)
      render json: { error: "invalid_credentials" }, status: :unauthorized and return
    end

    user = uc.user
    token = SecureRandom.uuid

    uv = UserVisit.find_or_initialize_by(user: user)
    uv.token = token
    uv.created_at ||= Time.current
    uv.save!

    response.set_header("X-Visitor-Token", token)
    render json: { ok: true, user_id: user.id }
  end

  def destroy
    if visitor_token.present?
      if (uv = UserVisit.find_by(token: visitor_token))
        uv.destroy
      end
    end
    head :no_content
  end
end
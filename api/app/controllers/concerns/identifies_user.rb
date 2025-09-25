module IdentifiesUser
  extend ActiveSupport::Concern

  included do
    before_action :identify_user
    attr_reader :current_user, :visitor_token
  end

  private

  def identify_user
    @visitor_token = request.headers['X-Visitor-Token'].presence
    if @visitor_token
      uv = UserVisit.includes(:user).find_by(token: @visitor_token)
      @current_user = uv&.user
    else
      @current_user = nil
    end
  end

  def ensure_visitor
    return if current_user.present?

    token = SecureRandom.uuid
    create_user_and_visit!(token)
    @visitor_token = token
    response.set_header('X-Visitor-Token', @visitor_token)
  end

  def create_user_and_visit!(token)
    @current_user = User.create!
    begin
      UserVisit.create!(user: @current_user, token: token, created_at: Time.current)
    rescue ActiveRecord::RecordNotUnique
      @current_user = UserVisit.find_by!(token: token).user
    end
  end
end

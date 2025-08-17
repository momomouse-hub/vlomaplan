class ApplicationController < ActionController::API
  include ActionController::RequestForgeryProtection

  protect_from_forgery with: :null_session
  include IdentifiesUser
  include Pagy::Backend
end

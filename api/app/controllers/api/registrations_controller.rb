class Api::RegistrationsController < ApplicationController
  def create
    ApplicationRecord.transaction do
      ensure_visitor if current_user.nil?

      render json: { error: "already_registered" }, status: :conflict and return if current_user.user_credential.present?

      uc = current_user.build_user_credential(registration_params)
      uc.save!

      uv = UserVisit.find_or_initialize_by(user: current_user)
      uv.token = SecureRandom.uuid
      uv.created_at ||= Time.current
      uv.save!
      response.set_header("X-Visitor-Token", uv.token)

      render json: { ok: true }, status: :created
    end
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: map_registration_error(e.record) }, status: :unprocessable_entity
  end

  private

  def registration_params
    params.permit(:email, :password, :password_confirmation)
  end

  def map_registration_error(record)
    return "email_unavailable" if record.errors.added?(:email, :taken)
    return "password_confirmation_mismatch" if record.errors.added?(:password_confirmation, :confirmation)
    return "weak_password" if record.errors.added?(:password, :too_short)

    "invalid_parameters"
  end
end

class User < ApplicationRecord
  has_one :user_credential, dependent: :destroy
  has_one :user_visit, dependent: :destroy
  has_many :travel_plans, dependent: :destroy
  has_many :wishlists, dependent: :destroy

  def registered?
    user_credential.present?
  end

  scope :unregistered, -> { left_joins(:user_credential).where(user_credentials: { id: nil }) }
  scope :expired_guests, ->(cutoff = Time.zone.now - 7.days) {
    unregistered.where('users.created_at < ?', cutoff)
  }
end

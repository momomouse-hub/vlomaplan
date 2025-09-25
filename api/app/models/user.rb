class User < ApplicationRecord
  has_one :user_credential, dependent: :destroy
  has_one :user_visit, dependent: :destroy

  def registered?
    user_credential.present?
  end
end

class UserVisit < ApplicationRecord
  belongs_to :user
  validates :token, presence: true, uniqueness: true, length: { maximum: 36 }
end

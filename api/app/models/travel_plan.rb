class TravelPlan < ApplicationRecord
  belongs_to :user
  has_many :travel_plan_items, -> { order(:sort_order, :id) }, dependent: :destroy
  has_many :places, through: :travel_plan_items

  validates :name, presence: true, length: { maximum: 100 }
end

class TravelPlanItem < ApplicationRecord
  belongs_to :travel_plan, inverse_of: :travel_plan_items
  belongs_to :place

  validates :sort_order, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :place_id, uniqueness: { scope: :travel_plan_id }
end

class Place < ApplicationRecord
  has_many :video_view_places, dependent: :destroy
  has_many :video_views, through: :video_view_places

  validates :place_id, presence: true, uniqueness: true
  validates :name, :address, :latitude, :longitude, presence: true
end
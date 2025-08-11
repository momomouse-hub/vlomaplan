class VideoViewPlace < ApplicationRecord
  belongs_to :video_view
  belongs_to :place

  validates :place_id, uniqueness: { scope: :video_view_id }
end
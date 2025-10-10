class VideoView < ApplicationRecord
  has_many :video_view_places, dependent: :destroy
  has_many :places, through: :video_view_places

  validates :youtube_video_id, presence: true, uniqueness: true
  validates :title, :thumbnail_url, presence: true
end

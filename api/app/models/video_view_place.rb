class VideoViewPlace < ApplicationRecord
  belongs_to :video_view
  belongs_to :place
end
class Api::BookmarksController < ApplicationController
  def create
    ActiveRecord::Base.transaction do
      vv = VideoView.find_or_initialize_by(youtube_video_id: vv_params[:youtube_video_id])
      vv.assign_attributes(
        title: vv_params[:title],
        thumbnail_url: vv_params[:thumbnail_url],
        search_history_id: vv_params[:search_history_id]
      )
      vv.save!

      place = Place.find_or_initialize_by(place_id: place_params[:place_id])
      place.assign_attributes(
        name: place_params[:name],
        address: place_params[:address],
        latitude: place_params[:latitude],
        longitude: place_params[:longitude]
      )
      place.save!

      VideoViewPlace.find_or_create_by!(video_view: vv, place: place)

      render json: {
        video_view: { id: vv.id, youtube_video_id: vv.youtube_video_id },
        place: { id: place.id, place_id: place.place_id, name: place.name },
        linked: true
      }, status: :created
    end
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  private
  def vv_params
    params.require(:video_view).permit(:youtube_video_id, :title, :thumbnail_url, :search_history_id)
  end

  def place_params
    params.require(:place).permit(:place_id, :name, :address, :latitude, :longitude)
  end
end
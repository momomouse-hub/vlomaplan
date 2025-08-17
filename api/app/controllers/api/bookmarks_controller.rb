class Api::BookmarksController < ApplicationController
  def create
    ApplicationRecord.transaction do
      vv_attrs = vv_params
      pl_attrs = place_params

      video_view = VideoView.find_or_create_by!(youtube_video_id: vv_attrs[:youtube_video_id]) do |vv|
        vv.title             = vv_attrs[:title]
        vv.thumbnail_url     = vv_attrs[:thumbnail_url]
        vv.search_history_id = vv_attrs[:search_history_id]
      end

      place = Place.find_or_create_by!(place_id: pl_attrs[:place_id]) do |p|
        p.name      = pl_attrs[:name]
        p.address   = pl_attrs[:address]
        p.latitude  = pl_attrs[:latitude]
        p.longitude = pl_attrs[:longitude]
      end

      VideoViewPlace.find_or_create_by!(video_view: video_view, place: place)

      wishlist = Wishlist.find_or_create_by!(user: current_user, place: place)

      render json: {
        video_view: { id: video_view.id, youtube_video_id: video_view.youtube_video_id },
        place: {
          id: place.id, place_id: place.place_id,
          name: place.name, address: place.address,
          latitude: place.latitude, longitude: place.longitude
        },
        wishlist: { id: wishlist.id, saved: true }
      }, status: :ok
    end
  rescue ActionController::ParameterMissing => e
    render json: { error: e.message }, status: :bad_request
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotUnique => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  private

  def vv_params
    params.require(:video_view).permit(:youtube_video_id, :title, :thumbnail_url, :search_history_id)
  end

  def place_params
    params.require(:place).permit(:place_id, :name, :address, :latitude, :longitude)
  end
end

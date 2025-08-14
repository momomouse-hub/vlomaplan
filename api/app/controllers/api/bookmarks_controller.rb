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

      VideoViewPlace.create_or_find_by!(video_view: vv, place: place)

      Wishlist.create_or_find_by!(user: current_user, place: place) do |w|
        w.created_at = Time.current
      end

      render json: {
        video_view: { id: vv.id, youtube_video_id: vv.youtube_video_id },
        place: { id: place.id, place_id: place.place_id, name: place.name },
        wishlist: { saved: true }
      }
    end
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  def exists
    youtube_id = params.require(:youtube_video_id)
    place_id = params.require(:place_id)

    vv = VideoView.find_by(youtube_video_id: youtube_id)
    place = Place.find_by(place_id: place_id)
    present = vv && place && VideoViewPlace.exists?(video_view_id: vv.id, place_id: place.id)
    render json: { exists: !!present }
  end

  def total_count
    total = VideoViewPlace.count
    render json: { total_count: total }
  end

  def place_status
    pid = params.require(:place_id)
    place = Place.find_by(place_id: pid)

    count = place ? place.video_view_places.count : 0

    thumb = nil
    if place && count > 0
      vvp = place.video_view_places
                .includes(:video_view)
                .order(created_at: :desc)
                .first
      thumb = vvp&.video_view&.thumbnail_url
    end

    render json: { saved: count > 0, count: count, thumbnail_url: thumb }
  end

  private
  def vv_params
    params.require(:video_view).permit(:youtube_video_id, :title, :thumbnail_url, :search_history_id)
  end

  def place_params
    params.require(:place).permit(:place_id, :name, :address, :latitude, :longitude)
  end
end
class Api::WishlistsController < ApplicationController
  def status
    pid = params.require(:place_id)
    place = Place.find_by(place_id: pid)

    saved = place.present? && Wishlist.exists?(user: current_user, place: place)

    thumb = nil
    if place
      vvp = place.video_view_places.includes(:video_view).order(created_at: :desc).first
      thumb = vvp&.video_view&.thumbnail_url
    end

    render json: { saved: saved, thumbnail_url: thumb }
  end

  def total_count
    cnt = Wishlist.where(user: current_user).count
    render json: { total_count: cnt }
  end
end
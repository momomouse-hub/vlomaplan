class Api::WishlistsController < ApplicationController
  def status
    pid   = params.require(:place_id)
    place = Place.find_by(place_id: pid)

    wishlist = place.present? ? Wishlist.find_by(user: current_user, place: place) : nil
    saved    = wishlist.present?

    thumb = nil
    if place
      vvp   = place.video_view_places.includes(:video_view).order(created_at: :desc).first
      thumb = vvp&.video_view&.thumbnail_url
    end

    render json: { saved: saved, thumbnail_url: thumb, wishlist_id: wishlist&.id }
  end

  def total_count
    cnt = Wishlist.where(user: current_user).count
    render json: { total_count: cnt }
  end

  def index
    base = Wishlist.where(user: current_user).includes(place: { video_view_places: :video_view }).order(created_at: :desc)
    @pagy, records = pagy_countless(base)

    items = records.map do |w|
      place      = w.place
      latest_vvp = place.video_view_places.max_by(&:created_at)
      thumb      = latest_vvp&.video_view&.thumbnail_url

      {
        id: w.id,
        created_at: w.created_at,
        place: {
          id: place.id,
          place_id: place.place_id,
          name: place.name,
          address: place.address,
          latitude: place.latitude,
          longitude: place.longitude
        },
        thumbnail_url: thumb
      }
    end

    render json: {
      items: items,
      pagination: pagy_metadata(@pagy)
    }
  end

  def destroy
    wl = Wishlist.find_by(id: params[:id], user: current_user)
    return head :not_found unless wl

    wl.destroy!
    head :no_content
  end
end

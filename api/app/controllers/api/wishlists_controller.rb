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

  def create
    pl_wrapped = params.expect(place: %i[place_id placeId name address latitude longitude])
    pl = pl_wrapped.is_a?(ActionController::Parameters) && (pl_wrapped.key?(:place) || pl_wrapped.key?('place')) ? (pl_wrapped[:place] || pl_wrapped['place']) : pl_wrapped
    raise ActionController::ParameterMissing, :place if pl.blank?

    vv = nil
    if params.key?(:video_view) || params.key?('video_view')
      vv_wrapped = params.expect(video_view: %i[youtube_video_id title thumbnail_url search_history_id])
      vv = vv_wrapped.is_a?(ActionController::Parameters) && (vv_wrapped.key?(:video_view) || vv_wrapped.key?('video_view')) ? (vv_wrapped[:video_view] || vv_wrapped['video_view']) : vv_wrapped
      raise ActionController::ParameterMissing, :video_view if vv.blank?

    end

    place_id = pl[:place_id].presence || pl[:placeId].presence
    return render json: { error: "place_id is required" }, status: :bad_request if place_id.blank?

    ApplicationRecord.transaction do
      place = Place.find_or_create_by!(place_id: place_id) do |p|
        p.name      = pl[:name]
        p.address   = pl[:address]
        p.latitude  = pl[:latitude]
        p.longitude = pl[:longitude]
      end

      if vv.present?
        video_view = VideoView.find_or_create_by!(youtube_video_id: vv[:youtube_video_id]) do |v|
          v.title             = vv[:title]
          v.thumbnail_url     = vv[:thumbnail_url]
          v.search_history_id = vv[:search_history_id]
        end
        VideoViewPlace.find_or_create_by!(video_view: video_view, place: place)
      end

      wishlist = Wishlist.find_or_create_by!(user: current_user, place: place)

      render json: {
        id: wishlist.id,
        saved: true,
        place: {
          id: place.id,
          place_id: place.place_id,
          name: place.name,
          address: place.address,
          latitude: place.latitude,
          longitude: place.longitude
        }
      }, status: :created
    end
  rescue ActionController::ParameterMissing => e
    render json: { error: e.message }, status: :bad_request
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotUnique => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  def destroy
    wl = Wishlist.find_by(id: params[:id], user: current_user)
    return head :not_found unless wl

    wl.destroy!
    head :no_content
  end

  private

  def place_params
    raw_wrapped = params.expect(place: %i[place_id placeId name address latitude longitude])
    raw = raw_wrapped.is_a?(ActionController::Parameters) && (raw_wrapped.key?(:place) || raw_wrapped.key?('place')) ? (raw_wrapped[:place] || raw_wrapped['place']) : raw_wrapped
    raise ActionController::ParameterMissing, :place if raw.blank?

    {
      place_id: raw[:place_id] || raw[:placeId],
      name: raw[:name],
      address: raw[:address],
      latitude: raw[:latitude],
      longitude: raw[:longitude]
    }
  end
end

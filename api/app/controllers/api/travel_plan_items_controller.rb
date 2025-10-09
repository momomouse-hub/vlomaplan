class Api::TravelPlanItemsController < ApplicationController
  before_action :set_plan
  before_action :ensure_visitor, only: [:create]

  def index
    items = @plan.travel_plan_items.includes(place: { video_view_places: :video_view }).order(:sort_order, :id)
    render json: { items: items.map { |it| serialize_item(it) } }
  end

  def create
    place = find_or_create_place!(place_params)

    item = nil
    TravelPlanItem.transaction do
      @plan.lock!
      next_order = (@plan.travel_plan_items.maximum(:sort_order) || -1) + 1
      item = @plan.travel_plan_items.find_or_initialize_by(place: place)
      if item.new_record?
        item.sort_order = next_order
        item.save!
        @plan.touch
      end
    end

    render json: serialize_item(item), status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  def destroy
    it = @plan.travel_plan_items.find_by(id: params[:id])
    return head :not_found unless it

    TravelPlanItem.transaction do
      @plan.lock!
      removed_order = it.sort_order
      it.destroy!
      @plan.travel_plan_items.where("sort_order > ?", removed_order).update_all("sort_order = sort_order - 1")
      @plan.touch
    end

    head :no_content
  end

  def reorder
    payload = params.require(:items)
    TravelPlanItem.transaction do
      @plan.lock!
      payload.each do |row|
        it = @plan.travel_plan_items.find(row[:id])
        it.update!(sort_order: Integer(row[:sort_order]))
      end
      @plan.touch
    end
    head :no_content
  end

  private

  def set_plan
    @plan = current_user ? TravelPlan.find_by(id: params[:travel_plan_id], user: current_user) : nil
    head :not_found unless @plan
  end

  def place_params
    params.require(:place).permit(:place_id, :placeId, :name, :address, :latitude, :longitude)
  end

  def find_or_create_place!(attrs)
    pid = attrs[:place_id] || attrs[:placeId]
    raise ActiveRecord::RecordInvalid.new(Place.new), "place_id is required" if pid.blank?

    if (place = Place.find_by(place_id: pid))
      return place
    end

    Place.create!(
      place_id: pid,
      name: attrs.fetch(:name),
      address: attrs.fetch(:address),
      latitude: attrs.fetch(:latitude),
      longitude: attrs.fetch(:longitude)
    )
  end

  def serialize_item(it)
    pl = it.place
    latest_vvp = pl.video_view_places.max_by(&:created_at)
    thumb = latest_vvp&.video_view&.thumbnail_url

    {
      id: it.id,
      sort_order: it.sort_order,
      created_at: it.created_at,
      place: {
        id: pl.id,
        place_id: pl.place_id,
        name: pl.name,
        address: pl.address,
        latitude: pl.latitude,
        longitude: pl.longitude
      },
      thumbnail_url: thumb
    }
  end
end

class Api::TravelPlanItemsController < ApplicationController
  before_action :set_plan
  before_action :ensure_visitor, only: [:create]

  def index
    items = @plan.travel_plan_items.includes(place: { video_view_places: :video_view }).order(:sort_order, :id)
    render json: { items: items.map { |item| serialize_item(item) } }
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
        @plan.update!(updated_at: Time.current)
      end
    end

    render json: serialize_item(item), status: :created
  rescue ActiveRecord::RecordInvalid => e
    render json: { error: e.record.errors.full_messages }, status: :unprocessable_entity
  end

  def destroy
    item = @plan.travel_plan_items.find_by(id: params[:id])
    return head :not_found unless item

    TravelPlanItem.transaction do
      @plan.lock!
      removed_order = item.sort_order
      item.destroy!
      @plan.travel_plan_items.where("sort_order > ?", removed_order).find_each do |row|
        row.update!(sort_order: row.sort_order - 1)
      end
      @plan.update!(updated_at: Time.current)
    end

    head :no_content
  end

  def reorder
    payload = params.require(:items)
    TravelPlanItem.transaction do
      @plan.lock!
      payload.each do |row|
        item = @plan.travel_plan_items.find(row[:id])
        item.update!(sort_order: Integer(row[:sort_order]))
      end
      @plan.update!(updated_at: Time.current)
    end
    head :no_content
  end

  private

  def set_plan
    @plan = current_user ? TravelPlan.find_by(id: params[:travel_plan_id], user: current_user) : nil
    head :not_found unless @plan
  end

  def place_params
    filtered = params.expect(place: %i[place_id placeId name address latitude longitude])
    place =
      if filtered.respond_to?(:key?) && (filtered.key?(:place) || filtered.key?('place'))
        filtered[:place] || filtered['place']
      else
        filtered
      end

    raise ActionController::ParameterMissing, :place if place.blank?

    place
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

  def serialize_item(item)
    pl = item.place
    latest_vvp = pl.video_view_places.max_by(&:created_at)
    thumb = latest_vvp&.video_view&.thumbnail_url

    {
      id: item.id,
      sort_order: item.sort_order,
      created_at: item.created_at,
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

class Api::TravelPlansController < ApplicationController
  include Pagy::Backend

  before_action :ensure_visitor, only: [:create]
  before_action :set_plan, only: [:show, :update, :destroy]

  def index
    return render json: { items: [], pagination: {} } unless current_user

    base = TravelPlan
      .where(user: current_user)
      .left_outer_joins(:travel_plan_items)
      .select('travel_plans.*, COUNT(travel_plan_items.id) AS items_count')
      .group('travel_plans.id')
      .order(updated_at: :desc)

    @pagy, recs = pagy_countless(base)
    items = recs.map { |p| serialize_plan(p, include_count: true) }
    render json: { items: items, pagination: pagy_metadata(@pagy) }
  end

  def create
    name = params.require(:name)
    plan = TravelPlan.create!(user: current_user, name: name)
    render json: serialize_plan(plan), status: :created
  end

  def contains
    pid = params.require(:place_id)
    place = Place.find_by(place_id: pid)
    plans = current_user ? TravelPlan.where(user: current_user) : TravelPlan.none

    data = plans.map do |p|
      it = place ? p.travel_plan_items.find_by(place_id: place.id) : nil
      { id: p.id, name: p.name, has_place: it.present?, item_id: it&.id }
    end

    render json: { plans: data, place_exists: place.present? }
  end

  def show
    render json: serialize_plan(@plan, include_count: true)
  end

  def update
    @plan.update!(name: params.require(:name))
    render json: serialize_plan(@plan, include_count: true)
  end

  def destroy
    @plan.destroy!
    head :no_content
  end

  private

  def set_plan
    @plan = current_user ? TravelPlan.find_by(id: params[:id], user: current_user) : nil
    return head :not_found unless @plan
  end

  def serialize_plan(p, include_count: false)
    h = { id: p.id, name: p.name, created_at: p.created_at, updated_at: p.updated_at }
    h[:items_count] = (p.respond_to?(:items_count) ? p.items_count.to_i : p.travel_plan_items.count) if include_count
    h
  end
end
class Api::WishlistsController < ApplicationController
  def total_count
    cnt = Wishlist.where(user: current_user).count
    render json: { total_count: cnt }
  end
end
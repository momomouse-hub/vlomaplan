Rails.application.routes.draw do
  namespace :api do
    resources :bookmarks, only: [:create] do
      collection do
        get :place_status
      end
    end
    resource :identity, only: [:show]
    resources :wishlists, only: [] do
      collection do
        get :total_count
      end
    end
  end
end

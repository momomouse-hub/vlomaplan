Rails.application.routes.draw do
  namespace :api do
    resources :bookmarks, only: [:create]
    resource :identity, only: [:show]
    resources :wishlists, only: [:index] do
      collection do
        get :total_count
        get :status
      end
    end
  end
end
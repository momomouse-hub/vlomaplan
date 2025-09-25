Rails.application.routes.draw do
  get :up, to: proc { [200, { 'Content-Type' => 'text/plain' }, ['ok']] }
  namespace :api do
    resources :bookmarks, only: [:create]
    resource :identity, only: [:show]
    resources :wishlists, only: [:index, :destroy] do
      collection do
        get :total_count
        get :status
      end
    end

    resource :registration, only: [:create]
    resource :session, only: [:create, :destroy]
  end
end

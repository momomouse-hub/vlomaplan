Rails.application.routes.draw do
  namespace :api do
    resources :bookmarks, only: [:create] do
      collection do
        get :exists
        get :total_count
        get :place_status
      end
    end
  end
end

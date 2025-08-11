Rails.application.routes.draw do
  namespace :api do
    resources :bookmarks, only: [:create] do
      collection do
        get :exists
        get :total_count
      end
    end
  end
end

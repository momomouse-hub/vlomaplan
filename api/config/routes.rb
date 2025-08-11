Rails.application.routes.draw do
  namespace :api do
    resources :bookmarks, only: [:create] do
      collection do
        get :exists
        get :count
      end
    end
  end
end

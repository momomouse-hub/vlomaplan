Rails.application.routes.draw do
  namespace :api do
    resources :bookmarks, only: :create
  end
end

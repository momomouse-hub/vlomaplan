Rails.application.routes.draw do
  get :up, to: proc { [200, { 'Content-Type' => 'text/plain' }, ['ok']] }
  namespace :api do
    resource :identity, only: [:show]
    resources :wishlists, only: [:index, :create, :destroy] do
      collection do
        get :total_count
        get :status
      end
    end

    resources :travel_plans, only: [:index, :create, :destroy, :update, :show] do
      get :contains, on: :collection

      resources :items, controller: "travel_plan_items", only: [:index, :create, :destroy] do
        patch :reorder, on: :collection
      end
    end

    resource :registration, only: [:create]
    resource :session, only: [:create, :destroy]
  end
end

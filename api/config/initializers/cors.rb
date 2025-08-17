# frozen_string_literal: true

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'http://localhost:5173', 'http://127.0.0.1:5173'

    resource '*',
             headers: :any,
             methods: [:get, :post, :put, :patch, :delete, :options],
             expose: %w[X-Visitor-Token],
             credentials: false,
             max_age: 600
  end
end

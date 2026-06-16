Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins(
      'http://localhost:3000',
      'http://localhost:3001',
      /https:\/\/.*\.vercel\.app$/,
      ENV.fetch('FRONTEND_URL', '')
    )

    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      expose: ['Authorization'],
      credentials: true
  end
end

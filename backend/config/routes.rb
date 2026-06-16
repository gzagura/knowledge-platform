Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      # Auth
      scope :auth do
        post 'register', to: 'auth#register'
        post 'login',    to: 'auth#login'
        get  'me',       to: 'auth#me'
      end

      # Articles
      scope :articles do
        get  'feed',         to: 'articles#feed'
        get  'random',       to: 'articles#random'
        get  'search',       to: 'articles#search'
        get  ':id',          to: 'articles#show'
        post ':id/like',     to: 'articles#like'
        delete ':id/like',   to: 'articles#unlike'
        post ':id/bookmark', to: 'articles#bookmark'
        delete ':id/bookmark', to: 'articles#unbookmark'
        post ':id/share',    to: 'articles#share'
        post ':id/not-interested', to: 'articles#not_interested'
      end
    end
  end

  # Health check
  get '/health', to: proc { [200, {}, [{ status: 'ok' }.to_json]] }
end

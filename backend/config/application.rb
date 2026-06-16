require_relative 'boot'

require 'rails'
require 'active_model/railtie'
require 'active_job/railtie'
require 'active_record/railtie'
require 'action_controller/railtie'
require 'action_view/railtie'

# Require the gems listed in Gemfile
Bundler.require(*Rails.groups)

module KnowledgePlatform
  class Application < Rails::Application
    config.load_defaults 7.1

    # API-only mode
    config.api_only = true

    # Autoload lib directory
    config.autoload_lib(ignore: %w[assets tasks])

    # Default timezone
    config.time_zone = 'UTC'

    # Encoding
    config.encoding = 'utf-8'

    # Null store for serverless (Vercel)
    config.cache_store = :null_store

    # Allow requests from any host (CORS handles it)
    config.hosts.clear
  end
end

require 'active_support/core_ext/integer/time'

Rails.application.configure do
  config.enable_reloading = false
  config.eager_load = true
  config.consider_all_requests_local = false

  # Logging
  config.log_level = ENV.fetch('LOG_LEVEL', 'info').to_sym
  config.log_tags = [:request_id]

  # Use default logging formatter
  config.logger = ActiveSupport::Logger.new($stdout)
    .tap { |l| l.formatter = Logger::Formatter.new }
    .then { |l| ActiveSupport::TaggedLogging.new(l) }

  # SSL
  config.force_ssl = false # Vercel handles SSL termination
end

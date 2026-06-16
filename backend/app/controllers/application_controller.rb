class ApplicationController < ActionController::API
  before_action :set_current_user

  rescue_from ActiveRecord::RecordNotFound do |e|
    render json: { error: e.message }, status: :not_found
  end

  rescue_from ActiveRecord::RecordInvalid do |e|
    render json: { error: e.record.errors.full_messages.join(', ') }, status: :unprocessable_entity
  end

  private

  # Sets @current_user from Bearer token, or nil if missing/invalid
  def set_current_user
    token = extract_token
    return @current_user = nil unless token

    payload = JwtService.decode(token)
    return @current_user = nil unless payload

    @current_user = User.find_by(id: payload['sub'])
  rescue StandardError
    @current_user = nil
  end

  def current_user
    @current_user
  end

  def authenticate_user!
    render json: { error: 'Not authenticated' }, status: :unauthorized unless current_user
  end

  def extract_token
    auth_header = request.headers['Authorization']
    return nil unless auth_header&.start_with?('Bearer ')

    auth_header.split(' ', 2).last
  end
end

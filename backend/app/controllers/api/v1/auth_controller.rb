module Api
  module V1
    class AuthController < ApplicationController
      before_action :authenticate_user!, only: [:me]

      # POST /api/v1/auth/register
      def register
        if User.exists?(email: params[:email]&.downcase)
          return render json: { error: 'Email already registered' }, status: :bad_request
        end

        user = User.new(
          email: params[:email],
          name:  params[:name],
          password: params[:password],
          password_confirmation: params[:password],
          provider: 'local'
        )

        if user.save
          token = JwtService.encode({ 'sub' => user.id.to_s, 'email' => user.email })
          render json: {
            access_token: token,
            token_type: 'bearer',
            user: user.as_json
          }, status: :created
        else
          render json: { error: user.errors.full_messages.join(', ') }, status: :unprocessable_entity
        end
      end

      # POST /api/v1/auth/login
      def login
        user = User.find_by(email: params[:email]&.downcase)

        unless user&.authenticate(params[:password])
          return render json: { error: 'Invalid email or password' }, status: :unauthorized
        end

        token = JwtService.encode({ 'sub' => user.id.to_s, 'email' => user.email })
        render json: {
          access_token: token,
          token_type: 'bearer',
          user: user.as_json
        }
      end

      # GET /api/v1/auth/me
      def me
        render json: current_user.as_json
      end
    end
  end
end

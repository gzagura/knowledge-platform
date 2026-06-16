require 'jwt'

class JwtService
  ALGORITHM = 'HS256'

  def self.secret
    ENV.fetch('JWT_SECRET', 'dev-secret-change-in-production')
  end

  # Encode a payload into a JWT token (30-day expiry)
  def self.encode(payload)
    payload = payload.merge(exp: 30.days.from_now.to_i)
    JWT.encode(payload, secret, ALGORITHM)
  end

  # Decode a JWT token. Returns HashWithIndifferentAccess or nil on failure.
  def self.decode(token)
    decoded = JWT.decode(token, secret, true, { algorithm: ALGORITHM })
    HashWithIndifferentAccess.new(decoded.first)
  rescue JWT::DecodeError, JWT::ExpiredSignature, JWT::VerificationError
    nil
  end
end

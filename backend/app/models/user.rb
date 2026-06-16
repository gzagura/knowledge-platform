class User < ApplicationRecord
  has_secure_password

  has_many :article_likes,    dependent: :destroy
  has_many :bookmarks,        dependent: :destroy
  has_many :article_shares,   dependent: :destroy
  has_many :article_feedbacks, dependent: :destroy

  validates :email, presence: true, uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :name,  presence: true
  validates :preferred_language, inclusion: { in: %w[en uk ru] }
  validates :theme, inclusion: { in: %w[light dark system auto] }

  before_save { self.email = email.downcase }

  # Serialise as JSON for API responses
  def as_json(*)
    {
      id: id,
      email: email,
      name: name,
      avatar_url: avatar_url,
      preferred_language: preferred_language,
      ui_language: ui_language,
      preferred_reading_time: preferred_reading_time,
      theme: theme,
      created_at: created_at
    }
  end
end

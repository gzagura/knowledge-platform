class ArticleFeedback < ApplicationRecord
  belongs_to :user
  belongs_to :article

  validates :user_id,       presence: true
  validates :article_id,    presence: true, uniqueness: { scope: :user_id }
  validates :feedback_type, inclusion: { in: %w[not_interested] }
end

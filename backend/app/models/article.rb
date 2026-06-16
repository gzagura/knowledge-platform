class Article < ApplicationRecord
  self.table_name = 'articles'

  has_many :article_likes,    dependent: :destroy
  has_many :bookmarks,        dependent: :destroy
  has_many :article_shares,   dependent: :destroy
  has_many :article_feedbacks, dependent: :destroy

  validates :title,    presence: true
  validates :extract,  presence: true
  validates :language, inclusion: { in: %w[en uk ru] }
  validates :wikipedia_id, presence: true

  scope :by_language, ->(lang) { where(language: lang) }
  scope :featured,    -> { where(is_featured: true) }
end

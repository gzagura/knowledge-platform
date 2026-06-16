require 'net/http'
require 'json'
require 'securerandom'

# Thin wrapper around the Wikipedia REST API.
# Used to fetch random articles and search — falls back gracefully on errors.
class WikipediaService
  BASE_URLS = {
    'en' => 'https://en.wikipedia.org',
    'uk' => 'https://uk.wikipedia.org',
    'ru' => 'https://ru.wikipedia.org'
  }.freeze

  CATEGORIES = %w[Science History Technology Art Geography Medicine Philosophy Sports Music Cinema].freeze

  # Returns an array of article hashes compatible with ArticleCard JSON
  def self.random_articles(lang: 'en', count: 5)
    base = BASE_URLS.fetch(lang, BASE_URLS['en'])
    uri = URI("#{base}/api/rest_v1/page/random/summary")

    articles = []
    count.times do
      data = get_json(uri)
      next unless data

      articles << build_article(data, lang)
    end
    articles
  rescue StandardError
    []
  end

  # Returns an array of article hashes matching the search query
  def self.search(query, lang: 'en', limit: 20)
    base = BASE_URLS.fetch(lang, BASE_URLS['en'])
    uri = URI("#{base}/w/api.php")
    uri.query = URI.encode_www_form(
      action: 'query',
      list: 'search',
      srsearch: query,
      srlimit: limit,
      format: 'json'
    )

    data = get_json(uri)
    return [] unless data&.dig('query', 'search')

    data['query']['search'].map do |item|
      {
        id: SecureRandom.uuid,
        wikipedia_id: item['pageid'],
        title: item['title'],
        extract: ActionController::Base.helpers.strip_tags(item['snippet'] || ''),
        category: nil,
        reading_time_minutes: estimate_reading_time(item['wordcount'] || 300),
        language: lang
      }
    end
  rescue StandardError
    []
  end

  private_class_method def self.get_json(uri)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.open_timeout = 5
    http.read_timeout = 8

    request = Net::HTTP::Get.new(uri)
    request['User-Agent'] = 'KnowledgePlatform/1.0 (knowledge-platform@example.com)'

    response = http.request(request)
    return nil unless response.is_a?(Net::HTTPSuccess)

    JSON.parse(response.body)
  rescue StandardError
    nil
  end

  private_class_method def self.build_article(data, lang)
    words = (data['extract'] || '').split.length
    {
      id: SecureRandom.uuid,
      wikipedia_id: data['pageid'] || 0,
      title: data['title'] || '',
      extract: data['extract'] || '',
      full_content: data['extract'] || '',
      category: CATEGORIES.sample,
      reading_time_minutes: estimate_reading_time(words),
      is_featured: false,
      image_url: data.dig('thumbnail', 'source'),
      language: lang,
      fun_fact: nil,
      url: data.dig('content_urls', 'desktop', 'page') || "https://#{lang}.wikipedia.org/wiki/#{URI.encode_www_form_component(data['title'] || '')}",
      is_liked: false,
      is_bookmarked: false,
      like_count: 0
    }
  end

  private_class_method def self.estimate_reading_time(word_count)
    [(word_count / 200).ceil, 1].max
  end
end

module Api
  module V1
    class ArticlesController < ApplicationController
      before_action :authenticate_user!, only: %i[like unlike bookmark unbookmark share not_interested]
      before_action :set_article, only: %i[show like unlike bookmark unbookmark share not_interested]

      # GET /api/v1/articles/feed
      def feed
        lang  = params.fetch(:lang, 'en').then { |l| %w[en uk ru].include?(l) ? l : 'en' }
        limit = [[params.fetch(:limit, 10).to_i, 100].min, 1].max
        skip  = [params.fetch(:skip, 0).to_i, 0].max

        articles = Article.by_language(lang)
                          .order(is_featured: :desc, created_at: :desc)
                          .offset(skip)
                          .limit(limit)

        render json: articles.map { |a| article_card_json(a) }
      end

      # GET /api/v1/articles/random
      def random
        lang  = params.fetch(:lang, 'en').then { |l| %w[en uk ru].include?(l) ? l : 'en' }
        count = [[params.fetch(:count, 5).to_i, 50].min, 1].max

        # Try live Wikipedia first, fall back to DB
        wiki_articles = WikipediaService.random_articles(lang: lang, count: count)

        if wiki_articles.any?
          return render json: { items: wiki_articles, total: wiki_articles.length }
        end

        articles = Article.by_language(lang).order('RANDOM()').limit(count)
        render json: { items: articles.map { |a| article_card_json(a) }, total: articles.length }
      end

      # GET /api/v1/articles/search?q=&lang=
      def search
        q = params[:q].to_s.strip
        return render json: [] if q.blank?

        lang = params.fetch(:lang, 'en').then { |l| %w[en uk ru].include?(l) ? l : 'en' }

        # Search DB first
        db_results = Article.by_language(lang)
                            .where('title ILIKE :q OR extract ILIKE :q', q: "%#{q}%")
                            .limit(20)

        if db_results.any?
          return render json: db_results.map { |a| search_article_json(a) }
        end

        # Fall back to Wikipedia search
        wiki_results = WikipediaService.search(q, lang: lang)
        render json: wiki_results
      end

      # GET /api/v1/articles/:id
      def show
        is_liked      = current_user ? ArticleLike.exists?(user_id: current_user.id, article_id: @article.id) : false
        is_bookmarked = current_user ? Bookmark.exists?(user_id: current_user.id, article_id: @article.id) : false
        like_count    = ArticleLike.where(article_id: @article.id).count

        render json: article_full_json(@article, is_liked: is_liked, is_bookmarked: is_bookmarked, like_count: like_count)
      end

      # POST /api/v1/articles/:id/like  (toggle)
      def like
        existing = ArticleLike.find_by(user_id: current_user.id, article_id: @article.id)
        if existing
          existing.destroy
          render json: { liked: false }
        else
          ArticleLike.create!(user_id: current_user.id, article_id: @article.id)
          render json: { liked: true }
        end
      end

      # DELETE /api/v1/articles/:id/like
      def unlike
        ArticleLike.find_by(user_id: current_user.id, article_id: @article.id)&.destroy
        render json: { liked: false }
      end

      # POST /api/v1/articles/:id/bookmark  (toggle)
      def bookmark
        existing = Bookmark.find_by(user_id: current_user.id, article_id: @article.id)
        if existing
          existing.destroy
          render json: { bookmarked: false }
        else
          Bookmark.create!(user_id: current_user.id, article_id: @article.id)
          render json: { bookmarked: true }
        end
      end

      # DELETE /api/v1/articles/:id/bookmark
      def unbookmark
        Bookmark.find_by(user_id: current_user.id, article_id: @article.id)&.destroy
        render json: { bookmarked: false }
      end

      # POST /api/v1/articles/:id/share
      def share
        platform = params.fetch(:platform, 'copy')
        ArticleShare.create!(user_id: current_user.id, article_id: @article.id, platform: platform)
        render json: { success: true }
      end

      # POST /api/v1/articles/:id/not-interested
      def not_interested
        feedback = ArticleFeedback.find_or_initialize_by(user_id: current_user.id, article_id: @article.id)
        feedback.update!(feedback_type: 'not_interested')
        render json: { message: 'not_interested' }
      end

      private

      def set_article
        @article = Article.find(params[:id])
      end

      # Full card JSON (matches ArticleCard TypeScript interface)
      def article_card_json(article, is_liked: false, is_bookmarked: false, like_count: nil)
        {
          id:                   article.id,
          wikipedia_id:         article.wikipedia_id,
          title:                article.title,
          extract:              article.extract,
          category:             article.category,
          reading_time_minutes: article.reading_time_minutes,
          is_featured:          article.is_featured,
          image_url:            article.image_url,
          language:             article.language,
          fun_fact:             article.fun_fact,
          url:                  article.url,
          is_liked:             is_liked,
          is_bookmarked:        is_bookmarked,
          like_count:           like_count || ArticleLike.where(article_id: article.id).count
        }
      end

      # Full article JSON (ArticleFull = ArticleCard + full_content)
      def article_full_json(article, is_liked:, is_bookmarked:, like_count:)
        article_card_json(article, is_liked: is_liked, is_bookmarked: is_bookmarked, like_count: like_count)
          .merge(full_content: article.full_content)
      end

      # Lightweight search result JSON
      def search_article_json(article)
        {
          id:                   article.id,
          title:                article.title,
          extract:              article.extract,
          category:             article.category,
          reading_time_minutes: article.reading_time_minutes,
          language:             article.language
        }
      end
    end
  end
end

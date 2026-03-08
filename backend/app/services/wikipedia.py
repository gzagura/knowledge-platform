import httpx
import time
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class WikipediaClient:
    """Async Wikipedia API client with in-memory cache."""

    def __init__(self, cache_ttl_seconds: int = 3600):
        self.base_url_template = "https://{lang}.wikipedia.org/w/api.php"
        self.cache: dict = {}
        self.cache_ttl = cache_ttl_seconds
        self.client = httpx.AsyncClient(timeout=30.0)

    def _get_cache_key(self, endpoint: str, params: dict) -> str:
        """Generate cache key from endpoint and params."""
        params_str = "_".join(f"{k}={v}" for k, v in sorted(params.items()))
        return f"{endpoint}_{params_str}"

    def _is_cache_valid(self, timestamp: float) -> bool:
        """Check if cache entry is still valid."""
        return (time.time() - timestamp) < self.cache_ttl

    async def get_random_articles(self, lang: str, count: int = 10) -> list[dict]:
        """
        Get random Wikipedia articles.
        """
        params = {
            "action": "query",
            "generator": "random",
            "grnnamespace": "0",
            "grnlimit": count,
            "prop": "extracts|pageprops|pageimages",
            "exintro": "true",
            "explaintext": "true",
            "pithumbsize": "400",
            "format": "json",
        }

        cache_key = self._get_cache_key("random", params)
        if cache_key in self.cache:
            timestamp, data = self.cache[cache_key]
            if self._is_cache_valid(timestamp):
                return data

        url = self.base_url_template.format(lang=lang)
        try:
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            articles = []
            if "query" in data and "pages" in data["query"]:
                for page_id, page_data in data["query"]["pages"].items():
                    article = {
                        "id": int(page_id),
                        "title": page_data.get("title", ""),
                        "extract": page_data.get("extract", ""),
                        "image_url": page_data.get("pageimage", {}) if isinstance(
                            page_data.get("pageimage"), dict
                        ) else None,
                        "language": lang,
                    }
                    # Get thumbnail URL if available
                    if "thumbnail" in page_data:
                        article["image_url"] = page_data["thumbnail"].get("source")
                    articles.append(article)

            self.cache[cache_key] = (time.time(), articles)
            return articles
        except Exception as e:
            logger.error(f"Error fetching random articles: {e}")
            return []

    async def get_articles_by_category(self, category: str, lang: str, limit: int = 20) -> list[dict]:
        """
        Get articles from a specific category.
        """
        params = {
            "action": "query",
            "list": "categorymembers",
            "cmtitle": f"Category:{category}",
            "cmlimit": limit,
            "format": "json",
        }

        cache_key = self._get_cache_key("category", params)
        if cache_key in self.cache:
            timestamp, data = self.cache[cache_key]
            if self._is_cache_valid(timestamp):
                return data

        url = self.base_url_template.format(lang=lang)
        try:
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            articles = []
            if "query" in data and "categorymembers" in data["query"]:
                for member in data["query"]["categorymembers"]:
                    if member["ns"] == 0:  # Main namespace
                        article = {
                            "id": member["pageid"],
                            "title": member["title"],
                            "language": lang,
                        }
                        articles.append(article)

            self.cache[cache_key] = (time.time(), articles)
            return articles
        except Exception as e:
            logger.error(f"Error fetching articles by category: {e}")
            return []

    async def get_article_full(self, page_id: int, lang: str) -> dict:
        """
        Get full article content (HTML).
        """
        cache_key = self._get_cache_key("full", {"pageid": page_id, "lang": lang})
        if cache_key in self.cache:
            timestamp, data = self.cache[cache_key]
            if self._is_cache_valid(timestamp):
                return data

        params = {
            "action": "parse",
            "pageid": page_id,
            "prop": "text",
            "format": "json",
        }

        url = self.base_url_template.format(lang=lang)
        try:
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            result = {}
            if "parse" in data:
                result["html"] = data["parse"].get("text", "")
                result["title"] = data["parse"].get("title", "")

            self.cache[cache_key] = (time.time(), result)
            return result
        except Exception as e:
            logger.error(f"Error fetching full article: {e}")
            return {}

    async def search_articles(self, query: str, lang: str, limit: int = 10) -> list[dict]:
        """
        Search Wikipedia articles.
        """
        params = {
            "action": "query",
            "list": "search",
            "srsearch": query,
            "srlimit": limit,
            "format": "json",
        }

        cache_key = self._get_cache_key("search", params)
        if cache_key in self.cache:
            timestamp, data = self.cache[cache_key]
            if self._is_cache_valid(timestamp):
                return data

        url = self.base_url_template.format(lang=lang)
        try:
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

            articles = []
            if "query" in data and "search" in data["query"]:
                for result in data["query"]["search"]:
                    article = {
                        "id": result["pageid"],
                        "title": result["title"],
                        "extract": result.get("snippet", ""),
                        "language": lang,
                    }
                    articles.append(article)

            self.cache[cache_key] = (time.time(), articles)
            return articles
        except Exception as e:
            logger.error(f"Error searching articles: {e}")
            return []

    async def close(self):
        """Close HTTP client."""
        await self.client.aclose()

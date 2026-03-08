import re
import bleach
from html.parser import HTMLParser


def sanitize_html(html: str) -> str:
    """Sanitize HTML content using bleach, allowing only safe tags."""
    allowed_tags = [
        "p",
        "br",
        "strong",
        "em",
        "u",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "ul",
        "ol",
        "li",
        "blockquote",
        "a",
        "code",
        "pre",
    ]
    allowed_attributes = {"a": ["href", "title"]}
    return bleach.clean(html, tags=allowed_tags, attributes=allowed_attributes, strip=True)


def calculate_reading_time(text: str) -> int:
    """Calculate reading time in minutes. Assumes 200 words per minute."""
    if not text:
        return 1

    # Remove HTML tags if present
    clean_text = re.sub(r"<[^>]+>", "", text)
    words = len(clean_text.split())
    reading_time = max(1, words // 200)
    return reading_time


def extract_fun_fact(text: str) -> str | None:
    """
    Extract an interesting sentence from text.
    Prefers sentences with "first", numbers, or superlatives.
    """
    if not text:
        return None

    # Remove HTML tags
    clean_text = re.sub(r"<[^>]+>", "", text)

    # Split into sentences
    sentences = re.split(r"[.!?]+", clean_text)
    sentences = [s.strip() for s in sentences if s.strip() and len(s.strip()) > 10]

    if not sentences:
        return None

    # Score sentences based on interesting features
    scored_sentences = []
    for sentence in sentences:
        score = 0

        # Bonus for "first" mentions
        if re.search(r"\b(first|oldest|earliest|largest|smallest)\b", sentence, re.IGNORECASE):
            score += 3

        # Bonus for numbers
        if re.search(r"\d+", sentence):
            score += 2

        # Bonus for superlatives
        if re.search(r"\b(most|least|best|worst)\b", sentence, re.IGNORECASE):
            score += 2

        scored_sentences.append((sentence, score))

    # Sort by score and return top sentence
    scored_sentences.sort(key=lambda x: x[1], reverse=True)
    if scored_sentences:
        return scored_sentences[0][0]

    # Fallback to first sentence if no interesting ones found
    return sentences[0] if sentences else None

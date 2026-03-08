"""Initial schema with users and articles.

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("avatar_url", sa.String(512), nullable=True),
        sa.Column("provider", sa.String(50), nullable=False),
        sa.Column("preferred_language", sa.String(10), nullable=False, server_default="en"),
        sa.Column("ui_language", sa.String(10), nullable=False, server_default="en"),
        sa.Column("preferred_reading_time", sa.Integer(), nullable=False, server_default="5"),
        sa.Column("theme", sa.String(20), nullable=False, server_default="auto"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email", name="uq_user_email"),
    )
    op.create_index("ix_user_email", "users", ["email"])

    # Create article_cache table
    op.create_table(
        "article_cache",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("wikipedia_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("extract", sa.Text(), nullable=False),
        sa.Column("full_content", sa.Text(), nullable=True),
        sa.Column("language", sa.String(10), nullable=False),
        sa.Column("category", sa.String(255), nullable=True),
        sa.Column("reading_time_minutes", sa.Integer(), nullable=False),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("image_url", sa.String(512), nullable=True),
        sa.Column("cached_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("wikipedia_id", "language", name="uq_article_cache_wiki_lang"),
    )
    op.create_index("ix_article_language", "article_cache", ["language"])
    op.create_index("ix_article_featured", "article_cache", ["is_featured"])
    op.create_index("ix_article_wikipedia_id", "article_cache", ["wikipedia_id"])

    # Create article_likes table
    op.create_table(
        "article_likes",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("article_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["article_id"], ["article_cache.id"], ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "article_id", name="uq_article_like_user_article"),
    )
    op.create_index("ix_like_article_id", "article_likes", ["article_id"])
    op.create_index("ix_like_user_id", "article_likes", ["user_id"])

    # Create bookmarks table
    op.create_table(
        "bookmarks",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("article_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["article_id"], ["article_cache.id"], ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "article_id", name="uq_bookmark_user_article"),
    )
    op.create_index("ix_bookmark_article_id", "bookmarks", ["article_id"])
    op.create_index("ix_bookmark_user_id", "bookmarks", ["user_id"])

    # Create article_feedback table
    op.create_table(
        "article_feedback",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("article_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("feedback", sa.String(50), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["article_id"], ["article_cache.id"], ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_feedback_article_id", "article_feedback", ["article_id"])
    op.create_index("ix_feedback_user_id", "article_feedback", ["user_id"])

    # Create reading_history table
    op.create_table(
        "reading_history",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("article_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("started_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("finished_at", sa.DateTime(), nullable=True),
        sa.Column("reading_duration_seconds", sa.Integer(), nullable=True),
        sa.Column("scroll_depth_percent", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(["article_id"], ["article_cache.id"], ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_reading_history_article_id", "reading_history", ["article_id"])
    op.create_index("ix_reading_history_user_id", "reading_history", ["user_id"])

    # Create article_shares table
    op.create_table(
        "article_shares",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("article_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("platform", sa.String(50), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["article_id"], ["article_cache.id"], ),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_share_article_id", "article_shares", ["article_id"])
    op.create_index("ix_share_user_id", "article_shares", ["user_id"])

    # Create user_interests table
    op.create_table(
        "user_interests",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("category_name", sa.String(255), nullable=False),
        sa.Column("weight", sa.Float(), nullable=False, server_default="1.0"),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "category_name", name="uq_user_interest_category"),
    )
    op.create_index("ix_interest_user_id", "user_interests", ["user_id"])


def downgrade() -> None:
    op.drop_table("user_interests")
    op.drop_table("article_shares")
    op.drop_table("reading_history")
    op.drop_table("article_feedback")
    op.drop_table("bookmarks")
    op.drop_table("article_likes")
    op.drop_table("article_cache")
    op.drop_table("users")

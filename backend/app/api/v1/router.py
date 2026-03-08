from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, articles, interactions, bookmarks, search

router = APIRouter(prefix="/api/v1")

# Include all endpoint routers
router.include_router(auth.router)
router.include_router(users.router)
router.include_router(articles.router)
router.include_router(interactions.router)
router.include_router(bookmarks.router)
router.include_router(search.router)

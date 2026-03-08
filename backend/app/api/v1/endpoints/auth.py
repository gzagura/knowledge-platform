from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import create_access_token, verify_token
from app.models import User
from app.schemas.user import UserCreate, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
async def login(
    user_create: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Login or create user.
    For MVP, simplified OAuth flow - creates user if doesn't exist.
    """
    # Check if user exists
    stmt = select(User).where(User.email == user_create.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        # Create new user
        user = User(
            email=user_create.email,
            name=user_create.name,
            provider=user_create.provider,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    # Create JWT token
    token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(user),
    }


@router.post("/refresh")
async def refresh_token(
    current_user: dict = None,
) -> dict:
    """
    Refresh JWT token.
    """
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    # Create new token with same claims
    token = create_access_token({
        "sub": current_user.get("sub"),
        "email": current_user.get("email"),
    })

    return {
        "access_token": token,
        "token_type": "bearer",
    }

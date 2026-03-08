from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import get_current_user
from app.models import User, UserInterest
from app.schemas.user import UserResponse, UserUpdate, InterestsUpdate

router = APIRouter(prefix="/users", tags=["users"])


async def get_user_or_404(user_id: UUID, db: AsyncSession) -> User:
    """Helper to get user or raise 404."""
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Get current user profile."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    user_id = UUID(current_user.get("sub"))
    user = await get_user_or_404(user_id, db)
    return user


@router.patch("/me", response_model=UserResponse)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Update current user profile."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    user_id = UUID(current_user.get("sub"))
    user = await get_user_or_404(user_id, db)

    # Update only provided fields
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.put("/me/interests")
async def update_user_interests(
    interests_update: InterestsUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Replace user's interests."""
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    user_id = UUID(current_user.get("sub"))
    user = await get_user_or_404(user_id, db)

    # Delete existing interests
    stmt = select(UserInterest).where(UserInterest.user_id == user_id)
    result = await db.execute(stmt)
    existing = result.scalars().all()
    for interest in existing:
        await db.delete(interest)

    # Add new interests
    for category in interests_update.interests:
        interest = UserInterest(
            user_id=user_id,
            category_name=category,
        )
        db.add(interest)

    await db.commit()

    return {
        "message": "Interests updated successfully",
        "interests": interests_update.interests,
    }

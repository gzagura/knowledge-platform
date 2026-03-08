import bcrypt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import create_access_token, get_current_user_required
from app.models import User
from app.schemas.user import UserRegister, UserLogin, UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Register a new user with email and password."""
    stmt = select(User).where(User.email == user_data.email)
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    password_hash = bcrypt.hashpw(
        user_data.password.encode(), bcrypt.gensalt()
    ).decode()

    user = User(
        email=user_data.email,
        name=user_data.name,
        provider="local",
        password_hash=password_hash,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user),
    }


@router.post("/login")
async def login(
    user_data: UserLogin,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Login with email and password."""
    stmt = select(User).where(User.email == user_data.email)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not bcrypt.checkpw(user_data.password.encode(), user.password_hash.encode()):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token({"sub": str(user.id), "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user),
    }


@router.get("/me")
async def get_me(
    current_user: dict = Depends(get_current_user_required),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    """Get current authenticated user."""
    from uuid import UUID
    stmt = select(User).where(User.id == UUID(current_user["sub"]))
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return UserResponse.model_validate(user)

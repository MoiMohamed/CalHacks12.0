from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.models.neuri.schema import UserCreate, UserRead, UserUpdate, UserProfileSetup
from app.repositories.base import AsyncSession, get_session
from app.response_models import SuccessResponse, SuccessListResponse
from app.services.user import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=SuccessResponse[UserRead])
async def create_user(
    user_data: UserCreate,
    session: AsyncSession = Depends(get_session),
    user_service: UserService = Depends(),
) -> SuccessResponse[UserRead]:
    """Create a new user"""
    user = await user_service.create_user(session, user_data)
    return SuccessResponse(data=user)


@router.get("/", response_model=SuccessListResponse[UserRead])
async def list_users(
    session: AsyncSession = Depends(get_session),
    user_service: UserService = Depends(),
) -> SuccessListResponse[UserRead]:
    """List all users"""
    users = await user_service.list_users(session)
    return SuccessListResponse(data=users)


@router.get("/{user_id}", response_model=SuccessResponse[UserRead])
async def get_user(
    user_id: UUID,
    session: AsyncSession = Depends(get_session),
    user_service: UserService = Depends(),
) -> SuccessResponse[UserRead]:
    """Get user by ID"""
    user = await user_service.get_user(session, user_id)
    return SuccessResponse(data=user)


@router.put("/{user_id}", response_model=SuccessResponse[UserRead])
async def update_user(
    user_id: UUID,
    user_data: UserUpdate,
    session: AsyncSession = Depends(get_session),
    user_service: UserService = Depends(),
) -> SuccessResponse[UserRead]:
    """Update user profile"""
    user = await user_service.update_user(session, user_id, user_data)
    return SuccessResponse(data=user)


@router.post("/{user_id}/update-profile", response_model=SuccessResponse[UserRead])
async def update_user_profile_post(
    user_id: UUID,
    user_data: UserUpdate,
    session: AsyncSession = Depends(get_session),
    user_service: UserService = Depends(),
) -> SuccessResponse[UserRead]:
    """Update user profile (POST version for VAPI compatibility)"""
    user = await user_service.update_user(session, user_id, user_data)
    return SuccessResponse(data=user)


@router.post("/{user_id}/setup-profile", response_model=SuccessResponse[UserRead])
async def setup_user_profile(
    user_id: UUID,
    profile_data: UserProfileSetup,
    session: AsyncSession = Depends(get_session),
    user_service: UserService = Depends(),
) -> SuccessResponse[UserRead]:
    """Set up initial user profile during onboarding"""
    user = await user_service.setup_user_profile(session, user_id, profile_data)
    return SuccessResponse(data=user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: UUID,
    session: AsyncSession = Depends(get_session),
    user_service: UserService = Depends(),
) -> None:
    """Delete user account"""
    await user_service.delete_user(session, user_id)

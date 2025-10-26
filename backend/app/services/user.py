from __future__ import annotations

from typing import Sequence
from uuid import UUID

from fastapi import Depends

from app.models.neuri.schema import UserCreate, UserRead, UserUpdate, RewardCreate
from app.repositories.base import AsyncSession
from app.repositories.user import UserRepository
from app.repositories.reward import RewardRepository


class UserService:
    user_repo: UserRepository
    reward_repo: RewardRepository

    def __init__(
        self,
        user_repo: UserRepository = Depends(UserRepository),
        reward_repo: RewardRepository = Depends(RewardRepository),
    ) -> None:
        self.user_repo = user_repo
        self.reward_repo = reward_repo

    async def create_user(self, session: AsyncSession, data: UserCreate) -> UserRead:
        """Create a new user"""
        user = await self.user_repo.create(session, data)
        reward_data = RewardCreate(user_id=user.id, points=0, last_reward_at=None, last_reward_type=None, last_reward_amount=0, last_reward_currency=None, last_reward_currency_amount=0)
        await self.reward_repo.create(session, reward_data)
        return UserRead.model_validate(user)

    async def get_user(self, session: AsyncSession, user_id: UUID) -> UserRead:
        """Get user by ID"""
        user = await self.user_repo.get_user_by_id(session, user_id)
        return UserRead.model_validate(user)

    async def get_user_by_email(
        self, session: AsyncSession, email: str
    ) -> UserRead | None:
        """Get user by email"""
        user = await self.user_repo.get_by_email(session, email)
        if user:
            return UserRead.model_validate(user)
        return None

    async def list_users(self, session: AsyncSession) -> Sequence[UserRead]:
        """List all users"""
        users = await self.user_repo.list_users(session)
        return [UserRead.model_validate(user) for user in users]

    async def update_user(
        self, session: AsyncSession, user_id: UUID, data: UserUpdate
    ) -> UserRead:
        """Update user"""
        user = await self.user_repo.update_by_uuid(session, user_id, data)
        return UserRead.model_validate(user)

    async def delete_user(self, session: AsyncSession, user_id: UUID) -> None:
        """Delete user"""
        await self.user_repo.delete_by_uuid(session, user_id)

    async def setup_user_profile(
        self,
        session: AsyncSession,
        user_id: UUID,
        pace: str,
        categories: list[str],
        preferred_work_time: str,
    ) -> UserRead:
        """Setup user profile with ADHD-specific preferences"""
        update_data = UserUpdate(pace=pace, preferred_work_time=preferred_work_time)
        user = await self.update_user(session, user_id, update_data)

        # Create categories for the user
        from app.services.category import CategoryService

        category_service = CategoryService()
        for category_name in categories:
            await category_service.create_category(session, user_id, category_name)

        return user

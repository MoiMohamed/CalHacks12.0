from __future__ import annotations

from typing import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.neuri.model import User
from app.models.neuri.schema import UserCreate, UserUpdate
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User, UserCreate, UserUpdate]):
    @property
    def model(self) -> type[User]:
        return User

    async def get_by_email(self, session: AsyncSession, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        return await self.get(session, stmt)

    async def list_users(self, session: AsyncSession) -> Sequence[User]:
        stmt = select(User)
        return await self.list(session, stmt)

    async def get_user_by_id(self, session: AsyncSession, user_id: UUID) -> User:
        stmt = select(User).filter_by(id=user_id)
        return await self.get(session, stmt)

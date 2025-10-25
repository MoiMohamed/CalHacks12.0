from __future__ import annotations

from typing import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.neuri.model import Category
from app.models.neuri.schema import CategoryCreate, CategoryUpdate
from app.repositories.base import BaseRepository


class CategoryRepository(BaseRepository[Category, CategoryCreate, CategoryUpdate]):
    @property
    def model(self) -> type[Category]:
        return Category

    async def list_by_user(self, session: AsyncSession, user_id: UUID) -> Sequence[Category]:
        stmt = select(Category).where(Category.user_id == user_id)
        return await self.list(session, stmt)

    async def get_category_by_id(self, session: AsyncSession, category_id: UUID) -> Category:
        stmt = select(Category).filter_by(id=category_id)
        return await self.get(session, stmt)

    async def get_by_name_and_user(self, session: AsyncSession, name: str, user_id: UUID) -> Category | None:
        stmt = select(Category).where(Category.name == name, Category.user_id == user_id)
        result = await session.execute(stmt)
        return result.scalar_one_or_none()

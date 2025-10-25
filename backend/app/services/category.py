from __future__ import annotations

from typing import Sequence
from uuid import UUID

from fastapi import Depends

from app.models.neuri.schema import CategoryCreate, CategoryRead, CategoryUpdate
from app.repositories.base import AsyncSession
from app.repositories.category import CategoryRepository


class CategoryService:
    category_repo: CategoryRepository

    def __init__(self, category_repo: CategoryRepository = Depends(CategoryRepository)) -> None:
        self.category_repo = category_repo

    async def create_category(self, session: AsyncSession, user_id: UUID, name: str) -> CategoryRead:
        """Create a new category"""
        data = CategoryCreate(name=name, user_id=user_id)
        category = await self.category_repo.create(session, data)
        return CategoryRead.model_validate(category)

    async def get_category(self, session: AsyncSession, category_id: UUID) -> CategoryRead:
        """Get category by ID"""
        category = await self.category_repo.get_category_by_id(session, category_id)
        return CategoryRead.model_validate(category)

    async def list_user_categories(self, session: AsyncSession, user_id: UUID) -> Sequence[CategoryRead]:
        """List categories for a user"""
        categories = await self.category_repo.list_by_user(session, user_id)
        return [CategoryRead.model_validate(category) for category in categories]

    async def update_category(self, session: AsyncSession, category_id: UUID, data: CategoryUpdate) -> CategoryRead:
        """Update category"""
        category = await self.category_repo.update_by_uuid(session, category_id, data)
        return CategoryRead.model_validate(category)

    async def delete_category(self, session: AsyncSession, category_id: UUID) -> None:
        """Delete category"""
        await self.category_repo.delete_by_uuid(session, category_id)

    async def get_or_create_category(self, session: AsyncSession, user_id: UUID, name: str) -> CategoryRead:
        """Get existing category or create new one"""
        category = await self.category_repo.get_by_name_and_user(session, name, user_id)
        if category:
            return CategoryRead.model_validate(category)
        return await self.create_category(session, user_id, name)

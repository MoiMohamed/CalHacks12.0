from __future__ import annotations

from typing import Sequence
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.neuri.model import Mission, MissionType
from app.models.neuri.schema import MissionCreate, MissionUpdate
from app.repositories.base import BaseRepository


class MissionRepository(BaseRepository[Mission, MissionCreate, MissionUpdate]):
    @property
    def model(self) -> type[Mission]:
        return Mission

    async def list_by_user(self, session: AsyncSession, user_id: UUID) -> Sequence[Mission]:
        stmt = select(Mission).where(Mission.user_id == user_id)
        return await self.list(session, stmt)

    async def list_by_category(self, session: AsyncSession, user_id: UUID, category_id: UUID) -> Sequence[Mission]:
        stmt = select(Mission).where(Mission.user_id == user_id, Mission.category_id == category_id)
        return await self.list(session, stmt)

    async def list_by_type(self, session: AsyncSession, user_id: UUID, mission_type: MissionType) -> Sequence[Mission]:
        stmt = select(Mission).where(Mission.user_id == user_id, Mission.type == mission_type)
        return await self.list(session, stmt)

    async def list_by_user_and_type(self, session: AsyncSession, user_id: UUID, mission_type: MissionType) -> Sequence[Mission]:
        stmt = select(Mission).where(Mission.user_id == user_id, Mission.type == mission_type)
        return await self.list(session, stmt)

    async def get_mission_by_id(self, session: AsyncSession, mission_id: UUID) -> Mission:
        stmt = select(Mission).filter_by(id=mission_id)
        return await self.get(session, stmt)

    async def list_sub_tasks(self, session: AsyncSession, user_id: UUID, parent_project_id: UUID) -> Sequence[Mission]:
        stmt = select(Mission).where(Mission.user_id == user_id, Mission.parent_project_id == parent_project_id)
        return await self.list(session, stmt)

    async def list_generated_by_routine(self, session: AsyncSession, user_id: UUID, routine_id: UUID) -> Sequence[Mission]:
        stmt = select(Mission).where(Mission.user_id == user_id, Mission.parent_routine_id == routine_id)
        return await self.list(session, stmt)

    async def list_completed_by_user(self, session: AsyncSession, user_id: UUID) -> Sequence[Mission]:
        stmt = select(Mission).where(Mission.user_id == user_id, Mission.is_complete == True)
        return await self.list(session, stmt)

    async def list_pending_by_user(self, session: AsyncSession, user_id: UUID) -> Sequence[Mission]:
        stmt = select(Mission).where(Mission.user_id == user_id, Mission.is_complete == False)
        return await self.list(session, stmt)

    async def get_today_missions(self, session: AsyncSession, user_id: UUID) -> Sequence[Mission]:
        """Get missions due today"""
        from datetime import datetime, date
        today = date.today()
        stmt = select(Mission).where(
            Mission.user_id == user_id,
            Mission.deadline.isnot(None),
            func.date(Mission.deadline) == today
        )
        return await self.list(session, stmt)

    async def get_overdue_missions(self, session: AsyncSession, user_id: UUID) -> Sequence[Mission]:
        """Get overdue missions"""
        from datetime import datetime
        now = datetime.now()
        stmt = select(Mission).where(
            Mission.user_id == user_id,
            Mission.deadline < now,
            Mission.is_complete == False
        )
        return await self.list(session, stmt)

    async def get_high_priority_missions(self, session: AsyncSession, user_id: UUID) -> Sequence[Mission]:
        """Get high priority missions (priority >= 7)"""
        stmt = select(Mission).where(
            Mission.user_id == user_id,
            Mission.priority >= 7,
            Mission.is_complete == False
        )
        return await self.list(session, stmt)

    async def get_heavy_missions(self, session: AsyncSession, user_id: UUID) -> Sequence[Mission]:
        """Get heavy missions (heaviness >= 7)"""
        stmt = select(Mission).where(
            Mission.user_id == user_id,
            Mission.heaviness >= 7,
            Mission.is_complete == False
        )
        return await self.list(session, stmt)

    async def search_missions_by_title(self, session: AsyncSession, user_id: UUID, search_term: str) -> Sequence[Mission]:
        """Search missions by title"""
        stmt = select(Mission).where(
            Mission.user_id == user_id,
            Mission.title.ilike(f"%{search_term}%")
        )
        return await self.list(session, stmt)

    async def get_recent_missions(self, session: AsyncSession, user_id: UUID, days: int = 7) -> Sequence[Mission]:
        """Get missions created in the last N days"""
        from datetime import datetime, timedelta
        cutoff = datetime.now() - timedelta(days=days)
        stmt = select(Mission).where(
            Mission.user_id == user_id,
            Mission.created_at >= cutoff
        )
        return await self.list(session, stmt)

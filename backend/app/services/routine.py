from __future__ import annotations

from typing import Sequence
from uuid import UUID
import json

from fastapi import Depends

from app.models.neuri.schema import RoutineCreate, RoutineRead, RoutineUpdate, RoutineCreateWithSchedule, RoutineTaskGenerationResponse
from app.repositories.base import AsyncSession
from app.repositories.routine import RoutineRepository


class RoutineService:
    routine_repo: RoutineRepository

    def __init__(self, routine_repo: RoutineRepository = Depends(RoutineRepository)) -> None:
        self.routine_repo = routine_repo

    async def create_routine(self, session: AsyncSession, data: RoutineCreate) -> RoutineRead:
        """Create a new routine"""
        routine = await self.routine_repo.create(session, data)
        return RoutineRead.model_validate(routine)

    async def get_routine(self, session: AsyncSession, routine_id: UUID) -> RoutineRead:
        """Get routine by ID"""
        routine = await self.routine_repo.get_routine_by_id(session, routine_id)
        return RoutineRead.model_validate(routine)

    async def list_user_routines(self, session: AsyncSession, user_id: UUID) -> Sequence[RoutineRead]:
        """List routines for a user"""
        routines = await self.routine_repo.list_by_user(session, user_id)
        return [RoutineRead.model_validate(routine) for routine in routines]

    async def list_category_routines(self, session: AsyncSession, user_id: UUID, category_id: UUID) -> Sequence[RoutineRead]:
        """List routines in a category"""
        routines = await self.routine_repo.list_by_category(session, user_id, category_id)
        return [RoutineRead.model_validate(routine) for routine in routines]

    async def update_routine(self, session: AsyncSession, routine_id: UUID, data: RoutineUpdate) -> RoutineRead:
        """Update routine"""
        routine = await self.routine_repo.update_by_uuid(session, routine_id, data)
        return RoutineRead.model_validate(routine)

    async def delete_routine(self, session: AsyncSession, routine_id: UUID) -> None:
        """Delete routine"""
        await self.routine_repo.delete_by_uuid(session, routine_id)

    async def create_routine_with_schedule(
        self, 
        session: AsyncSession, 
        user_id: UUID, 
        title: str, 
        schedule_items: list[dict],
        category_id: UUID | None = None
    ) -> RoutineRead:
        """Create routine with parsed schedule"""
        schedule_json = json.dumps(schedule_items)
        data = RoutineCreate(
            user_id=user_id,
            category_id=category_id,
            title=title,
            schedule=schedule_json
        )
        return await self.create_routine(session, data)

    async def parse_schedule(self, routine: RoutineRead) -> list[dict]:
        """Parse routine schedule from JSON string"""
        if not routine.schedule:
            return []
        try:
            return json.loads(routine.schedule)
        except (json.JSONDecodeError, TypeError):
            return []

    async def get_routines_for_day(self, session: AsyncSession, user_id: UUID, day: str) -> Sequence[RoutineRead]:
        """Get routines scheduled for a specific day"""
        routines = await self.routine_repo.list_by_user(session, user_id)
        day_routines = []
        
        for routine in routines:
            routine_read = RoutineRead.model_validate(routine)
            schedule_items = await self.parse_schedule(routine_read)
            
            for item in schedule_items:
                if item.get("day", "").upper() == day.upper():
                    day_routines.append(routine_read)
                    break
        
        return day_routines

    async def generate_tasks_for_days(self, session: AsyncSession, routine_id: UUID, days: int) -> RoutineTaskGenerationResponse:
        """Generate tasks for a routine over N days"""
        # Get the routine
        routine = await self.get_routine(session, routine_id)
        
        # Generate tasks using repository method
        generated_tasks = await self.routine_repo.generate_tasks_for_days(session, routine_id, days)
        
        return RoutineTaskGenerationResponse(
            routine=routine,
            days_requested=days,
            generated_tasks=generated_tasks,
            total_tasks=len(generated_tasks)
        )

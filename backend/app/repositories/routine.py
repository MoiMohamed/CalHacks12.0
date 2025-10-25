from __future__ import annotations

from typing import Sequence
from uuid import UUID
from datetime import datetime, timedelta
import json

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.neuri.model import Routine
from app.models.neuri.schema import RoutineCreate, RoutineUpdate, GeneratedTask
from app.repositories.base import BaseRepository


class RoutineRepository(BaseRepository[Routine, RoutineCreate, RoutineUpdate]):
    @property
    def model(self) -> type[Routine]:
        return Routine

    async def list_by_user(self, session: AsyncSession, user_id: UUID) -> Sequence[Routine]:
        stmt = select(Routine).where(Routine.user_id == user_id)
        return await self.list(session, stmt)

    async def list_by_category(self, session: AsyncSession, user_id: UUID, category_id: UUID) -> Sequence[Routine]:
        stmt = select(Routine).where(Routine.user_id == user_id, Routine.category_id == category_id)
        return await self.list(session, stmt)

    async def get_routine_by_id(self, session: AsyncSession, routine_id: UUID) -> Routine:
        stmt = select(Routine).filter_by(id=routine_id)
        return await self.get(session, stmt)

    async def get_by_title_and_user(self, session: AsyncSession, title: str, user_id: UUID) -> Routine | None:
        stmt = select(Routine).where(Routine.title == title, Routine.user_id == user_id)
        return await self.get(session, stmt)

    async def generate_tasks_for_days(self, session: AsyncSession, routine_id: UUID, days: int) -> list[GeneratedTask]:
        """Generate tasks for a routine over N days based on its schedule"""
        routine = await self.get_routine_by_id(session, routine_id)
        
        if not routine.schedule:
            return []
        
        # Parse the schedule JSON
        try:
            schedule_items = json.loads(routine.schedule)
        except (json.JSONDecodeError, TypeError):
            return []
        
        generated_tasks = []
        start_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Day mapping
        day_mapping = {
            'MON': 0, 'TUES': 1, 'WED': 2, 'THURS': 3, 'FRI': 4, 'SAT': 5, 'SUN': 6,
            'MONDAY': 0, 'TUESDAY': 1, 'WEDNESDAY': 2, 'THURSDAY': 3, 
            'FRIDAY': 4, 'SATURDAY': 5, 'SUNDAY': 6
        }
        
        # Generate tasks for each day in the requested period
        for day_offset in range(days):
            current_date = start_date + timedelta(days=day_offset)
            current_weekday = current_date.weekday()
            
            # Check if any schedule item matches this day
            for schedule_item in schedule_items:
                day_str = schedule_item.get('day', '').upper()
                time_str = schedule_item.get('time', '09:00')
                
                if day_str not in day_mapping:
                    continue
                
                scheduled_weekday = day_mapping[day_str]
                
                # Only generate task if the day matches
                if current_weekday == scheduled_weekday:
                    # Parse time if provided
                    task_date = current_date
                    try:
                        if ':' in time_str:
                            hour, minute = map(int, time_str.split(':'))
                            task_date = task_date.replace(hour=hour, minute=minute)
                        elif time_str.lower() == 'morning':
                            task_date = task_date.replace(hour=9, minute=0)
                        elif time_str.lower() == 'afternoon':
                            task_date = task_date.replace(hour=14, minute=0)
                        elif time_str.lower() == 'evening':
                            task_date = task_date.replace(hour=18, minute=0)
                        else:
                            task_date = task_date.replace(hour=9, minute=0)  # Default to 9 AM
                    except (ValueError, AttributeError):
                        task_date = task_date.replace(hour=9, minute=0)  # Default to 9 AM
                    
                    generated_task = GeneratedTask(
                        title=routine.title,
                        scheduled_date=task_date,
                        day_number=day_offset + 1,
                        day_of_week=day_str
                    )
                    generated_tasks.append(generated_task)
        
        return generated_tasks

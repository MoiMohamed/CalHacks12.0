from typing import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tasks.model import Task
from app.models.tasks.schema import TaskCreate, TaskUpdate
from app.repositories.base import BaseRepository


class TaskRepository(BaseRepository[Task, TaskCreate, TaskUpdate]):
    @property
    def model(self) -> type[Task]:
        return Task

    async def list_tasks(self, session: AsyncSession) -> Sequence[Task]:
        stmt = select(Task)
        return await self.list(session, stmt)

    async def get_task_by_id(self, session: AsyncSession, task_id: UUID) -> Task:
        return await self.get_by_uuid(session, task_id)

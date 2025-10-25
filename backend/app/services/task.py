from typing import Sequence
from uuid import UUID

from fastapi import Depends

from app.models.tasks.schema import TaskCreate, TaskRead, TaskUpdate
from app.repositories.base import AsyncSession
from app.repositories.task import TaskRepository


class TaskService:
    task_repo: TaskRepository

    def __init__(self, task_repo: TaskRepository = Depends(TaskRepository)) -> None:
        self.task_repo = task_repo

    async def list_tasks(self, session: AsyncSession) -> Sequence[TaskRead]:
        tasks = await self.task_repo.list_tasks(session)
        return [TaskRead.model_validate(task) for task in tasks]

    async def create_task(self, session: AsyncSession, data: TaskCreate) -> TaskRead:
        task = await self.task_repo.create(session, data)
        return TaskRead.model_validate(task)

    async def get_task(self, session: AsyncSession, task_id: UUID) -> TaskRead:
        task = await self.task_repo.get_task_by_id(session, task_id)
        return TaskRead.model_validate(task)

    async def update_task(
        self, session: AsyncSession, task_id: UUID, data: TaskUpdate
    ) -> TaskRead:
        task = await self.task_repo.update_by_uuid(session, task_id, data)
        return TaskRead.model_validate(task)

    async def delete_task(self, session: AsyncSession, task_id: UUID) -> None:
        await self.task_repo.delete_by_uuid(session, task_id)

from __future__ import annotations

from typing import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.neuri.model import Reward
from app.models.neuri.schema import RewardCreate, RewardUpdate
from app.repositories.base import BaseRepository


class RewardRepository(BaseRepository[Reward, RewardCreate, RewardUpdate]):
    @property
    def model(self) -> type[Reward]:
        return Reward

    async def get_by_user(self, session: AsyncSession, user_id: UUID) -> Reward | None:
        stmt = select(Reward).where(Reward.user_id == user_id)
        return await self.get(session, stmt)

    async def get_reward_by_id(self, session: AsyncSession, reward_id: UUID) -> Reward:
        stmt = select(Reward).filter_by(id=reward_id)
        return await self.get(session, stmt)

    async def list_rewards(self, session: AsyncSession) -> Sequence[Reward]:
        stmt = select(Reward)
        return await self.list(session, stmt)

    async def update_points(self, session: AsyncSession, user_id: UUID, points_change: int) -> Reward:
        """Add or subtract points from user's reward"""
        reward = await self.get_by_user(session, user_id)
        if not reward:
            raise ValueError(f"No reward found for user {user_id}")
        
        reward.points += points_change
        return reward

    async def update_streak(self, session: AsyncSession, user_id: UUID, streak_change: int) -> Reward:
        """Update user's streak"""
        reward = await self.get_by_user(session, user_id)
        if not reward:
            raise ValueError(f"No reward found for user {user_id}")
        
        reward.streak += streak_change
        return reward

    async def increment_tasks_done(self, session: AsyncSession, user_id: UUID) -> Reward:
        """Increment total tasks done counter"""
        reward = await self.get_by_user(session, user_id)
        if not reward:
            raise ValueError(f"No reward found for user {user_id}")
        
        reward.total_tasks_done += 1
        return reward

    async def add_points_for_mission(self, session: AsyncSession, user_id: UUID, mission_type: str, is_subtask: bool = False) -> Reward:
        """Add points based on mission type and size"""
        reward = await self.get_by_user(session, user_id)
        if not reward:
            raise ValueError(f"No reward found for user {user_id}")
        
        # Point system based on business logic
        if is_subtask:
            points = 1  # Small task (sub-task) = +1 point
        elif mission_type == "task":
            points = 3  # Regular task = +3 points
        elif mission_type == "project":
            points = 5  # Big task (parent task) = +5 points
        elif mission_type == "reminder":
            points = 2  # Reminder = +2 points
        elif mission_type == "note":
            points = 1  # Note = +1 point
        else:
            points = 1  # Default
        
        reward.points += points
        await self._update_tree_stage(reward)
        return reward

    async def _update_tree_stage(self, reward: Reward) -> None:
        """Update tree stage based on points"""
        if reward.points <= 5:
            reward.tree_stage = "seed"
        elif reward.points <= 15:
            reward.tree_stage = "sprout"
        elif reward.points <= 30:
            reward.tree_stage = "sapling"
        elif reward.points <= 50:
            reward.tree_stage = "small-tree"
        else:
            reward.tree_stage = "full-tree"

    async def get_tree_progress(self, session: AsyncSession, user_id: UUID) -> dict:
        """Get tree progress information"""
        reward = await self.get_by_user(session, user_id)
        if not reward:
            return {"stage": "seed", "points": 0, "next_stage_points": 6}
        
        next_stage_points = {
            "seed": 6,
            "sprout": 16,
            "sapling": 31,
            "small-tree": 51,
            "full-tree": None
        }
        
        return {
            "stage": reward.tree_stage,
            "points": reward.points,
            "next_stage_points": next_stage_points.get(reward.tree_stage),
            "total_tasks_done": reward.total_tasks_done,
            "streak": reward.streak
        }

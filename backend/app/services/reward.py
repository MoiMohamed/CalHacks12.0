from __future__ import annotations

from typing import Sequence
from uuid import UUID

from fastapi import Depends

from app.models.neuri.schema import RewardCreate, RewardRead, RewardUpdate
from app.repositories.base import AsyncSession
from app.repositories.reward import RewardRepository


class RewardService:
    reward_repo: RewardRepository

    def __init__(self, reward_repo: RewardRepository = Depends(RewardRepository)) -> None:
        self.reward_repo = reward_repo

    async def create_reward(self, session: AsyncSession, data: RewardCreate) -> RewardRead:
        """Create a new reward record for user"""
        reward = await self.reward_repo.create(session, data)
        return RewardRead.model_validate(reward)

    async def get_user_reward(self, session: AsyncSession, user_id: UUID) -> RewardRead:
        """Get reward for a user"""
        reward = await self.reward_repo.get_by_user(session, user_id)
        if not reward:
            # Create default reward if doesn't exist
            reward_data = RewardCreate(user_id=user_id)
            reward = await self.reward_repo.create(session, reward_data)
        return RewardRead.model_validate(reward)

    async def get_reward(self, session: AsyncSession, reward_id: UUID) -> RewardRead:
        """Get reward by ID"""
        reward = await self.reward_repo.get_reward_by_id(session, reward_id)
        return RewardRead.model_validate(reward)

    async def list_rewards(self, session: AsyncSession) -> Sequence[RewardRead]:
        """List all rewards"""
        rewards = await self.reward_repo.list_rewards(session)
        return [RewardRead.model_validate(reward) for reward in rewards]

    async def update_reward(self, session: AsyncSession, reward_id: UUID, data: RewardUpdate) -> RewardRead:
        """Update reward"""
        reward = await self.reward_repo.update_by_uuid(session, reward_id, data)
        return RewardRead.model_validate(reward)

    async def delete_reward(self, session: AsyncSession, reward_id: UUID) -> None:
        """Delete reward"""
        await self.reward_repo.delete_by_uuid(session, reward_id)

    async def add_points(self, session: AsyncSession, user_id: UUID, points: int) -> RewardRead:
        """Add points to user's reward"""
        reward = await self.reward_repo.update_points(session, user_id, points)
        return RewardRead.model_validate(reward)

    async def update_streak(self, session: AsyncSession, user_id: UUID, streak_change: int) -> RewardRead:
        """Update user's streak"""
        reward = await self.reward_repo.update_streak(session, user_id, streak_change)
        return RewardRead.model_validate(reward)

    async def increment_tasks_done(self, session: AsyncSession, user_id: UUID) -> RewardRead:
        """Increment tasks done counter"""
        reward = await self.reward_repo.increment_tasks_done(session, user_id)
        return RewardRead.model_validate(reward)

    async def add_mission_points(self, session: AsyncSession, user_id: UUID, mission_type: str, is_subtask: bool = False) -> RewardRead:
        """Add points for completing a mission"""
        reward = await self.reward_repo.add_points_for_mission(session, user_id, mission_type, is_subtask)
        return RewardRead.model_validate(reward)

    async def get_tree_progress(self, session: AsyncSession, user_id: UUID) -> dict:
        """Get tree progress for ADHD gamification"""
        return await self.reward_repo.get_tree_progress(session, user_id)

    async def get_dashboard_stats(self, session: AsyncSession, user_id: UUID) -> dict:
        """Get dashboard statistics for ADHD user"""
        reward = await self.get_user_reward(session, user_id)
        tree_progress = await self.get_tree_progress(session, user_id)
        
        return {
            "points": reward.points,
            "streak": reward.streak,
            "total_tasks_done": reward.total_tasks_done,
            "tree_stage": reward.tree_stage,
            "tree_progress": tree_progress,
            "milestones_unlocked": reward.milestones_unlocked or []
        }

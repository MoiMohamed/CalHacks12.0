from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.models.neuri.schema import RewardRead, DashboardStats
from app.repositories.base import AsyncSession, get_session
from app.response_models import SuccessResponse
from app.services.reward import RewardService

router = APIRouter(prefix="/rewards", tags=["Rewards"])


@router.get("/user/{user_id}", response_model=SuccessResponse[RewardRead])
async def get_user_reward(
    user_id: UUID,
    session: AsyncSession = Depends(get_session),
    reward_service: RewardService = Depends(),
) -> SuccessResponse[RewardRead]:
    """Get user's reward profile"""
    reward = await reward_service.get_user_reward(session, user_id)
    return SuccessResponse(data=reward)


@router.post("/user/{user_id}/add-mission-points", response_model=SuccessResponse[RewardRead])
async def add_mission_points(
    user_id: UUID,
    mission_type: str,
    is_subtask: bool = False,
    session: AsyncSession = Depends(get_session),
    reward_service: RewardService = Depends(),
) -> SuccessResponse[RewardRead]:
    """Add points for completing a mission"""
    reward = await reward_service.add_mission_points(session, user_id, mission_type, is_subtask)
    return SuccessResponse(data=reward)


@router.patch("/user/{user_id}/update-streak", response_model=SuccessResponse[RewardRead])
async def update_user_streak(
    user_id: UUID,
    streak_change: int,
    session: AsyncSession = Depends(get_session),
    reward_service: RewardService = Depends(),
) -> SuccessResponse[RewardRead]:
    """Update user's streak"""
    reward = await reward_service.update_user_streak(session, user_id, streak_change)
    return SuccessResponse(data=reward)


@router.get("/user/{user_id}/tree-progress", response_model=SuccessResponse[dict])
async def get_tree_progress(
    user_id: UUID,
    session: AsyncSession = Depends(get_session),
    reward_service: RewardService = Depends(),
) -> SuccessResponse[dict]:
    """Get tree progress information"""
    progress = await reward_service.get_tree_progress(session, user_id)
    return SuccessResponse(data=progress)


@router.get("/user/{user_id}/dashboard-stats", response_model=SuccessResponse[DashboardStats])
async def get_dashboard_stats(
    user_id: UUID,
    session: AsyncSession = Depends(get_session),
    reward_service: RewardService = Depends(),
) -> SuccessResponse[DashboardStats]:
    """Get dashboard statistics"""
    stats = await reward_service.get_dashboard_stats(session, user_id)
    return SuccessResponse(data=stats)
